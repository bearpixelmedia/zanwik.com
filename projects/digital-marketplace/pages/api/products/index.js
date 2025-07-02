import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        search, 
        sort = 'newest',
        minPrice,
        maxPrice
      } = req.query

      const skip = (parseInt(page) - 1) * parseInt(limit)

      // Build where clause
      const where = {
        isActive: true,
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search] } }
          ]
        }),
        ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice) } })
      }

      // Build orderBy clause
      let orderBy = {}
      switch (sort) {
        case 'price-low':
          orderBy = { price: 'asc' }
          break
        case 'price-high':
          orderBy = { price: 'desc' }
          break
        case 'rating':
          orderBy = { rating: 'desc' }
          break
        case 'popular':
          orderBy = { downloads: 'desc' }
          break
        default:
          orderBy = { createdAt: 'desc' }
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                reviews: true,
                favorites: true
              }
            }
          },
          orderBy,
          skip,
          take: parseInt(limit)
        }),
        prisma.product.count({ where })
      ])

      const totalPages = Math.ceil(total / parseInt(limit))

      res.json({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('Get products error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const {
        title,
        description,
        price,
        originalPrice,
        category,
        tags,
        images,
        fileUrl,
        fileSize
      } = req.body

      // Validate input
      if (!title || !description || !price || !category || !fileUrl) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Check if user is a seller
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user.isSeller) {
        return res.status(403).json({ error: 'Must be a seller to create products' })
      }

      const product = await prisma.product.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          category,
          tags: tags || [],
          images: images || [],
          fileUrl,
          fileSize: parseInt(fileSize) || 0,
          sellerId: session.user.id
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

      res.status(201).json({ product })
    } catch (error) {
      console.error('Create product error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
} 