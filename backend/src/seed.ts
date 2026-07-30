import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Category from './models/Category'
import Product from './models/Product'
import Review from './models/Review'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zanwik'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Review.deleteMany({})])
  console.log('Cleared existing data')

  const categories = await Category.insertMany([
    { name: 'CRM Software', slug: 'crm', description: 'Customer relationship management tools to manage interactions with customers and prospects.', icon: '/images/crm.svg', productCount: 0, subcategories: [{ name: 'Small Business CRM', slug: 'small-business-crm' }, { name: 'Enterprise CRM', slug: 'enterprise-crm' }] },
    { name: 'HR Software', slug: 'hr', description: 'Human resources software for managing employee data, payroll, benefits and more.', icon: '/images/hr.svg', productCount: 0, subcategories: [{ name: 'Payroll', slug: 'payroll' }, { name: 'Benefits Admin', slug: 'benefits-admin' }] },
    { name: 'EMR Software', slug: 'emr-software', description: 'Electronic medical records software for healthcare practices.', icon: '/images/emr.svg', productCount: 0, subcategories: [{ name: 'Cloud EMR', slug: 'cloud-emr' }, { name: 'Mental Health EHR', slug: 'mental-health-ehr' }] },
    { name: 'LMS Software', slug: 'lms', description: 'Learning management systems for training and education.', icon: '/images/lms.svg', productCount: 0, subcategories: [{ name: 'Corporate LMS', slug: 'corporate-lms' }, { name: 'Academic LMS', slug: 'academic-lms' }] },
  ])
  console.log(`Seeded ${categories.length} categories`)

  const products = await Product.insertMany([
    { name: 'SalesFlow', slug: 'salesflow', tagline: 'Modern CRM for growing sales teams', description: 'Track leads, manage pipelines, and close deals faster with AI-powered insights.', website: 'https://salesflow.example.com', category: categories[0]._id, pricing: 'From $29/user/mo', features: ['Pipeline Management', 'Email Tracking', 'AI Lead Scoring'] },
    { name: 'PeopleFirst HR', slug: 'peoplefirst-hr', tagline: 'All-in-one HR platform', description: 'Manage payroll, benefits, time-off, and performance reviews.', website: 'https://peoplefirst.example.com', category: categories[1]._id, pricing: 'From $8/employee/mo', features: ['Payroll', 'Benefits Admin', 'Time Tracking'] },
    { name: 'MediRecord EMR', slug: 'medirecord-emr', tagline: 'Cloud EMR for small practices', description: 'Streamline clinical workflows with customizable templates and e-prescribing.', website: 'https://medirecord.example.com', category: categories[2]._id, pricing: 'From $299/provider/mo', features: ['Custom Templates', 'e-Prescribing', 'Patient Portal'] },
    { name: 'LearnPath LMS', slug: 'learnpath-lms', tagline: 'Engaging learning platform', description: 'Create, deliver, and track training programs.', website: 'https://learnpath.example.com', category: categories[3]._id, pricing: 'From $5/user/mo', features: ['Course Authoring', 'Assessments', 'Gamification'] },
  ])
  console.log(`Seeded ${products.length} products`)

  const reviews = await Review.insertMany([
    { product: products[0]._id, user: 'Sarah M.', rating: 5, title: 'Transformed our sales', body: 'Helped us increase our close rate by 40%.', pros: 'Easy to use, great AI', cons: 'Mobile app could improve' },
    { product: products[0]._id, user: 'James R.', rating: 4, title: 'Solid CRM', body: 'Great integrations and powerful reporting.', pros: 'Integrations', cons: 'Learning curve' },
    { product: products[1]._id, user: 'Lisa K.', rating: 5, title: 'Best HR tool', body: 'Simplified our entire HR process.', pros: 'All-in-one', cons: 'None' },
    { product: products[3]._id, user: 'David W.', rating: 5, title: 'Engaging LMS', body: 'Employees actually enjoy using it.', pros: 'Gamification works', cons: 'More templates needed' },
  ])
  console.log(`Seeded ${reviews.length} reviews`)

  await Promise.all(categories.map(async (cat, i) => {
    const count = await Product.countDocuments({ category: cat._id })
    await Category.findByIdAndUpdate(cat._id, { productCount: count })
  }))
  console.log('Updated product counts')

  await mongoose.disconnect()
  console.log('Seed complete!')
}

seed().catch(err => { console.error(err); process.exit(1) })
