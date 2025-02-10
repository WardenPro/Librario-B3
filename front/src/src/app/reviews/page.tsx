import ReviewsClient from "./ReviewsClient"

export default function ReviewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Évaluations</h1>
      <ReviewsClient />
    </div>
  )
}

