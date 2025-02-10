import { Star } from "lucide-react"

type RatingProps = {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
}

export default function Rating({ value, onChange, readonly = false }: RatingProps) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= value ? "text-yellow-400 fill-current" : "text-gray-300"
          } ${!readonly && "cursor-pointer"}`}
          onClick={() => !readonly && onChange && onChange(star)}
        />
      ))}
    </div>
  )
}

