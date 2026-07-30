import { Review } from '@/types'

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < review.rating ? '\u2605' : '\u2606'}</span>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900">{review.rating}.0</span>
      </div>
      <h3 className="font-semibold text-gray-900">{review.title}</h3>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{review.body}</p>
      <div className="mt-4 text-sm">
        <p className="font-medium text-gray-900">Pros:</p>
        <p className="text-gray-600">{review.pros}</p>
      </div>
      <div className="mt-2 text-sm">
        <p className="font-medium text-gray-900">Cons:</p>
        <p className="text-gray-600">{review.cons}</p>
      </div>
      <p className="mt-4 text-xs text-gray-400">- {review.user}, {review.createdAt}</p>
    </div>
  )
}
