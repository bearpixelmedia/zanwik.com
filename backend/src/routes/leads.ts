import { Router, Request, Response } from 'express'
import Lead from '../models/Lead'
import { authenticate, requireRole } from '../middleware/auth'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const lead = await Lead.create(req.body)
    res.status(201).json(lead)
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit lead' })
  }
})

router.get('/', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 })
    res.json(leads)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

export default router
