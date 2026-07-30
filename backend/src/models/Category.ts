import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
  subcategories: { name: string; slug: string }[]
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  productCount: { type: Number, default: 0 },
  subcategories: [{ name: String, slug: String }]
}, { timestamps: true })

export default mongoose.model<ICategory>('Category', CategorySchema)
