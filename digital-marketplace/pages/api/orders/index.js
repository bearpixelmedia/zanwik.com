import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, status } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)

      const where = {
        buyerId: session.user.id,
        ...(status && { status })
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.order.count({ where })
      ])

      const totalPages = Math.ceil(total / parseInt(limit))

      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('Get orders error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { productId } = req.body

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' })
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { seller: true }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (!product.isActive) {
        return res.status(400).json({ error: 'Product is not available' })
      }

      if (product.sellerId === session.user.id) {
        return res.status(400).json({ error: 'Cannot purchase your own product' })
      }

      // Calculate commission
      const commission = product.price * product.seller.commissionRate

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount: product.price,
          commission,
          buyerId: session.user.id,
          productId
        }
      })

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(product.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order.id,
          productId: product.id,
          buyerId: session.user.id,
          sellerId: product.sellerId
        }
      })

      // Update order with payment intent
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntent: paymentIntent.id }
      })

      res.json({
        order,
        clientSecret: paymentIntent.client_secret
      })
    } catch (error) {
      console.error('Create order error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
} 