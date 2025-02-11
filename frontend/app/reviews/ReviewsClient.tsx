"use client"

import { useState } from "react"
import { Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Review = {
  id: number
  bookId: number
  userId: number
  rating: number
  comment: string
}

const reviewsData: Review[] = [
  { id: 1, bookId: 1, userId: 1, rating: 5, comment: "Excellent livre, je le recommande vivement !" },
  { id: 2, bookId: 2, userId: 2, rating: 4, comment: "Très bon livre, mais un peu long par moments." },
  { id: 3, bookId: 3, userId: 3, rating: 3, comment: "Intéressant, mais pas exceptionnel." },
]

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>(reviewsData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentReview, setCurrentReview] = useState<Review | null>(null)

  const handleAddReview = (newReview: Omit<Review, "id">) => {
    setReviews([...reviews, { ...newReview, id: reviews.length + 1 }])
    setIsDialogOpen(false)
  }

  const handleEditReview = (updatedReview: Review) => {
    setReviews(reviews.map((review) => (review.id === updatedReview.id ? updatedReview : review)))
    setIsDialogOpen(false)
  }

  const handleDeleteReview = (id: number) => {
    setReviews(reviews.filter((review) => review.id !== id))
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setCurrentReview(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter une évaluation
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Livre</TableHead>
            <TableHead>ID Utilisateur</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.bookId}</TableCell>
              <TableCell>{review.userId}</TableCell>
              <TableCell>{review.rating}</TableCell>
              <TableCell>{review.comment}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentReview(review)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(review.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentReview ? "Modifier l'évaluation" : "Ajouter une évaluation"}</DialogTitle>
            <DialogDescription>
              {currentReview
                ? "Modifiez les détails de l'évaluation ici."
                : "Entrez les détails de la nouvelle évaluation ici."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const reviewData = {
                bookId: Number.parseInt(formData.get("bookId") as string, 10),
                userId: Number.parseInt(formData.get("userId") as string, 10),
                rating: Number.parseInt(formData.get("rating") as string, 10),
                comment: formData.get("comment") as string,
              }
              if (currentReview) {
                handleEditReview({ ...reviewData, id: currentReview.id })
              } else {
                handleAddReview(reviewData)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bookId" className="text-right">
                  ID Livre
                </Label>
                <Input
                  id="bookId"
                  name="bookId"
                  type="number"
                  defaultValue={currentReview?.bookId}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  ID Utilisateur
                </Label>
                <Input
                  id="userId"
                  name="userId"
                  type="number"
                  defaultValue={currentReview?.userId}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">
                  Note
                </Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={currentReview?.rating}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">
                  Commentaire
                </Label>
                <Textarea id="comment" name="comment" defaultValue={currentReview?.comment} className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{currentReview ? "Modifier" : "Ajouter"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

