import { buffer } from 'micro'
import { prisma } from '../../../lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}

async function handlePaymentSuccess(paymentIntent) {
  const { orderId, productId, buyerId, sellerId } = paymentIntent.metadata

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID' }
  })

  // Increment product downloads
  await prisma.product.update({
    where: { id: productId },
    data: { downloads: { increment: 1 } }
  })

  // Create notification for seller
  await prisma.notification.create({
    data: {
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: `You received a payment of $${paymentIntent.amount / 100} for your product.`,
      userId: sellerId
    }
  })

  // Create notification for buyer
  await prisma.notification.create({
    data: {
      type: 'ORDER_COMPLETED',
      title: 'Order Completed',
      message: 'Your purchase has been completed successfully. You can now download your product.',
      userId: buyerId
    }
  })
}

async function handlePaymentFailure(paymentIntent) {
  const { orderId } = paymentIntent.metadata

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' }
  })
} 