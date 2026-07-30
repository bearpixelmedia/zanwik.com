import { Router, Request, Response } from 'express'
import Category from '../models/Category'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const cats = await Category.find().sort({ name: 1 })
    res.json(cats)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug })
    if (!cat) return res.status(404).json({ error: 'Category not found' })
    res.json(cat)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

export default router
