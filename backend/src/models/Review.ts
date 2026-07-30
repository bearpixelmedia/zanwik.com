import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  product: mongoose.Types.ObjectId
  user: string
  rating: number
  title: string
  body: string
  pros: string
  cons: string
}

const ReviewSchema = new Schema<IReview>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  body: { type: String, required: true },
  pros: { type: String, default: '' },
  cons: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model<IReview>('Review', ReviewSchema)
