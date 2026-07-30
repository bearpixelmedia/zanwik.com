export interface Category {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
  subcategories: Subcategory[]
}

export interface Subcategory {
  name: string
  slug: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  tagline: string
  description: string
  logo: string
  website: string
  category: Category
  pricing: string
  rating: number
  reviewCount: number
  features: string[]
}

export interface Review {
  _id: string
  product: string
  user: string
  rating: number
  title: string
  body: string
  pros: string
  cons: string
  createdAt: string
}

export interface Testimonial {
  name: string
  company: string
  role: string
  avatar: string
  quote: string
  stats: { label: string; value: string }[]
}

export interface Resource {
  _id: string
  title: string
  slug: string
  excerpt: string
  image: string
  author: string
  date: string
  category: string
}
