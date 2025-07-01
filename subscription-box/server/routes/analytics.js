const express = require('express');
const CustomerSubscription = require('../models/CustomerSubscription');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, businessOwner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get business overview analytics
// @access  Private (Business Owner)
router.get('/overview', [auth, businessOwner], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total subscribers
    const totalSubscribers = await CustomerSubscription.countDocuments({
      businessOwner: req.user._id,
      status: 'active'
    });

    // New subscribers in period
    const newSubscribers = await CustomerSubscription.countDocuments({
      businessOwner: req.user._id,
      status: 'active',
      startDate: { $gte: startDate }
    });

    // Cancelled subscriptions in period
    const cancelledSubscriptions = await CustomerSubscription.countDocuments({
      businessOwner: req.user._id,
      status: 'cancelled',
      endDate: { $gte: startDate }
    });

    // Total revenue
    const totalRevenue = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPaid' }
        }
      }
    ]);

    // Monthly recurring revenue
    const mrr = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Churn rate
    const churnRate = totalSubscribers > 0 ? (cancelledSubscriptions / totalSubscribers) * 100 : 0;

    res.json({
      totalSubscribers,
      newSubscribers,
      cancelledSubscriptions,
      totalRevenue: totalRevenue[0]?.total || 0,
      mrr: mrr[0]?.total || 0,
      churnRate: Math.round(churnRate * 100) / 100
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Business Owner)
router.get('/revenue', [auth, businessOwner], async (req, res) => {
  try {
    const { period = '12' } = req.query;
    const months = parseInt(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Monthly revenue breakdown
    const monthlyRevenue = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'active',
          startDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          revenue: { $sum: '$price' },
          subscribers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Revenue by subscription tier
    const revenueByTier = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'active'
        }
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscription',
          foreignField: '_id',
          as: 'subscriptionDetails'
        }
      },
      {
        $unwind: '$subscriptionDetails'
      },
      {
        $group: {
          _id: '$subscriptionDetails.name',
          revenue: { $sum: '$price' },
          subscribers: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      monthlyRevenue,
      revenueByTier
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/subscribers
// @desc    Get subscriber analytics
// @access  Private (Business Owner)
router.get('/subscribers', [auth, businessOwner], async (req, res) => {
  try {
    const { period = '12' } = req.query;
    const months = parseInt(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Subscriber growth over time
    const subscriberGrowth = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          startDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          newSubscribers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Subscriber status breakdown
    const statusBreakdown = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average subscription duration
    const avgDuration = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: { $in: ['cancelled', 'paused'] }
        }
      },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({
      subscriberGrowth,
      statusBreakdown,
      avgDuration: Math.round(avgDuration[0]?.avgDuration || 0)
    });
  } catch (error) {
    console.error('Subscriber analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/products
// @desc    Get product analytics
// @access  Private (Business Owner)
router.get('/products', [auth, businessOwner], async (req, res) => {
  try {
    // Product performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: { $in: ['shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $group: {
          _id: '$productDetails._id',
          name: { $first: '$productDetails.name' },
          sku: { $first: '$productDetails.sku' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      businessOwner: req.user._id,
      stockQuantity: { $lte: '$lowStockThreshold' }
    }).select('name sku stockQuantity lowStockThreshold');

    // Product categories performance
    const categoryPerformance = await Product.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          category: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stockQuantity' }
        }
      }
    ]);

    res.json({
      productPerformance,
      lowStockProducts,
      categoryPerformance
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/orders
// @desc    Get order analytics
// @access  Private (Business Owner)
router.get('/orders', [auth, businessOwner], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Daily order volume
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json({
      orderStatusBreakdown,
      dailyOrders,
      avgOrderValue: avgOrderValue[0]?.avgValue || 0,
      totalOrders: avgOrderValue[0]?.totalOrders || 0
    });
  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/churn
// @desc    Get churn analytics
// @access  Private (Business Owner)
router.get('/churn', [auth, businessOwner], async (req, res) => {
  try {
    const { period = '12' } = req.query;
    const months = parseInt(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Monthly churn rate
    const monthlyChurn = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'cancelled',
          endDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$endDate' },
            month: { $month: '$endDate' }
          },
          cancelled: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Churn reasons (if tracked)
    const churnReasons = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'cancelled',
          notes: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$notes',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Average time to churn
    const avgTimeToChurn = await CustomerSubscription.aggregate([
      {
        $match: {
          businessOwner: req.user._id,
          status: 'cancelled',
          endDate: { $exists: true }
        }
      },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({
      monthlyChurn,
      churnReasons,
      avgTimeToChurn: Math.round(avgTimeToChurn[0]?.avgDuration || 0)
    });
  } catch (error) {
    console.error('Churn analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 