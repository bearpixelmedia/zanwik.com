const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function getCategories() { return fetchAPI('/categories') }
export function getCategory(slug: string) { return fetchAPI(`/categories/${slug}`) }
export function getProducts(category?: string) {
  const qs = category ? `?category=${category}` : ''
  return fetchAPI(`/products${qs}`)
}
export function getProduct(slug: string) { return fetchAPI(`/products/${slug}`) }
export function getReviews(product?: string) {
  const qs = product ? `?product=${product}` : ''
  return fetchAPI(`/reviews${qs}`)
}
export function getResources() { return fetchAPI('/resources') }
export function submitLead(data: Record<string, string>) {
  return fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
}
