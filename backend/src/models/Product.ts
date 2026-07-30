import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  slug: string
  tagline: string
  description: string
  logo: string
  website: string
  category: mongoose.Types.ObjectId
  pricing: string
  rating: number
  reviewCount: number
  features: string[]
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  pricing: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  features: [String]
}, { timestamps: true })

export default mongoose.model<IProduct>('Product', ProductSchema)
