import { Router, Request, Response } from 'express'
import Review from '../models/Review'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: any = {}
    if (req.query.product) filter.product = req.query.product
    const reviews = await Review.find(filter).sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const review = await Review.create(req.body)
    res.status(201).json(review)
  } catch (err) {
    res.status(400).json({ error: 'Failed to create review' })
  }
})

export default router
