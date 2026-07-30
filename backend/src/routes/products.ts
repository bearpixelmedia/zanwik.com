import { Router, Request, Response } from 'express'
import Product from '../models/Product'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: any = {}
    if (req.query.category) filter.category = req.query.category
    const products = await Product.find(filter).populate('category').sort({ name: 1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category')
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

export default router
