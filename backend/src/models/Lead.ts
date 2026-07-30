import mongoose, { Schema, Document } from 'mongoose'

export interface ILead extends Document {
  name: string
  email: string
  phone: string
  organization: string
  description: string
  status: 'new' | 'contacted' | 'qualified' | 'closed'
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  organization: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new' }
}, { timestamps: true })

export default mongoose.model<ILead>('Lead', LeadSchema)
