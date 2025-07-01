const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, businessOwner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products for business owner
// @access  Private (Business Owner)
router.get('/', [auth, businessOwner], async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, inStock } = req.query;
    
    const query = { businessOwner: req.user._id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (inStock !== undefined) {
      if (inStock === 'true') {
        query.stockQuantity = { $gt: 0 };
      } else {
        query.stockQuantity = { $lte: 0 };
      }
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Business Owner)
router.post('/', [auth, businessOwner], [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('brand').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('cost').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('reorderQuantity').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      category,
      brand,
      price,
      cost,
      stockQuantity = 0,
      weight,
      dimensions,
      images = [],
      variants = [],
      tags = [],
      attributes = [],
      supplier,
      lowStockThreshold = 10,
      reorderPoint = 5,
      reorderQuantity = 50,
      leadTime = 7,
      isSubscriptionOnly = false
    } = req.body;

    const product = new Product({
      businessOwner: req.user._id,
      name,
      description,
      category,
      brand,
      price,
      cost,
      stockQuantity,
      weight,
      dimensions,
      images,
      variants,
      tags,
      attributes,
      supplier,
      lowStockThreshold,
      reorderPoint,
      reorderQuantity,
      leadTime,
      isSubscriptionOnly
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private (Business Owner)
router.get('/:id', [auth, businessOwner], async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Business Owner)
router.put('/:id', [auth, businessOwner], [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('cost').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (product.schema.paths[key]) {
        product[key] = req.body[key];
      }
    });

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Business Owner)
router.delete('/:id', [auth, businessOwner], async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is used in any active subscriptions
    const Subscription = require('../models/Subscription');
    const subscriptionsUsingProduct = await Subscription.find({
      businessOwner: req.user._id,
      'products.product': req.params.id,
      isActive: true
    });

    if (subscriptionsUsingProduct.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product that is used in active subscriptions' 
      });
    }

    await product.remove();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Business Owner)
router.put('/:id/stock', [auth, businessOwner], [
  body('quantity').isInt({ min: 0 }),
  body('operation').isIn(['add', 'subtract', 'set'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, operation } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update stock based on operation
    switch (operation) {
      case 'add':
        product.stockQuantity += quantity;
        break;
      case 'subtract':
        if (product.stockQuantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        product.stockQuantity -= quantity;
        break;
      case 'set':
        product.stockQuantity = quantity;
        break;
    }

    await product.save();

    res.json({
      message: 'Stock updated successfully',
      product: {
        id: product._id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        isLowStock: product.isLowStock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private (Business Owner)
router.get('/low-stock', [auth, businessOwner], async (req, res) => {
  try {
    const products = await Product.find({
      businessOwner: req.user._id,
      stockQuantity: { $lte: '$lowStockThreshold' }
    }).sort({ stockQuantity: 1 });

    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private (Business Owner)
router.get('/categories', [auth, businessOwner], async (req, res) => {
  try {
    const categories = await Product.distinct('category', {
      businessOwner: req.user._id,
      category: { $exists: true, $ne: null, $ne: '' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/variants
// @desc    Add variant to product
// @access  Private (Business Owner)
router.post('/:id/variants', [auth, businessOwner], [
  body('name').trim().notEmpty(),
  body('value').trim().notEmpty(),
  body('priceAdjustment').optional().isFloat(),
  body('stockQuantity').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      businessOwner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, value, priceAdjustment = 0, stockQuantity = 0 } = req.body;

    // Check if variant already exists
    const existingVariant = product.variants.find(
      v => v.name === name && v.value === value
    );

    if (existingVariant) {
      return res.status(400).json({ message: 'Variant already exists' });
    }

    product.variants.push({
      name,
      value,
      priceAdjustment,
      stockQuantity
    });

    await product.save();

    res.json({
      message: 'Variant added successfully',
      product
    });
  } catch (error) {
    console.error('Add variant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 