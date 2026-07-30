import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { connectDB } from './config/database'
import categoryRoutes from './routes/categories'
import productRoutes from './routes/products'
import reviewRoutes from './routes/reviews'
import authRoutes from './routes/auth'
import leadRoutes from './routes/leads'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
