import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
              website: true
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
              orders: true
            }
          }
        }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Check if user has favorited this product
      let isFavorited = false
      if (session) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId: id
            }
          }
        })
        isFavorited = !!favorite
      }

      res.json({ product, isFavorited })
    } catch (error) {
      console.error('Get product error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { seller: true }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (product.sellerId !== session.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this product' })
      }

      const {
        title,
        description,
        price,
        originalPrice,
        category,
        tags,
        images,
        isActive
      } = req.body

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price && { price: parseFloat(price) }),
          ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
          ...(category && { category }),
          ...(tags && { tags }),
          ...(images && { images }),
          ...(isActive !== undefined && { isActive })
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      })

      res.json({ product: updatedProduct })
    } catch (error) {
      console.error('Update product error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { seller: true }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      if (product.sellerId !== session.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this product' })
      }

      await prisma.product.delete({
        where: { id }
      })

      res.json({ message: 'Product deleted successfully' })
    } catch (error) {
      console.error('Delete product error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
} 