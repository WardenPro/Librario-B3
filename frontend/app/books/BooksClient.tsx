"use client"

import { useState } from "react"
import { Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Type pour un livre
type Book = {
  id: number
  title: string
  author: string
  isbn: string
  copies: number
  imageUrl: string
}

// Données factices pour les livres
const booksData: Book[] = [
  {
    id: 1,
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    isbn: "9780156012195",
    copies: 5,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    copies: 3,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    copies: 2,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
]

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>(booksData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  const handleAddBook = (newBook: Omit<Book, "id">) => {
    setBooks([...books, { ...newBook, id: books.length + 1 }])
    setIsDialogOpen(false)
  }

  const handleEditBook = (updatedBook: Book) => {
    setBooks(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    setIsDialogOpen(false)
  }

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setCurrentBook(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter un livre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-2 aspect-h-3 relative">
              <Image
                src={book.imageUrl || "/placeholder.svg"}
                alt={`Couverture de ${book.title}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">par {book.author}</p>
              <p className="text-sm text-muted-foreground mb-1">ISBN: {book.isbn}</p>
              <p className="text-sm text-muted-foreground mb-4">Exemplaires: {book.copies}</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentBook(book)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" /> Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteBook(book.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentBook ? "Modifier le livre" : "Ajouter un livre"}</DialogTitle>
            <DialogDescription>
              {currentBook ? "Modifiez les détails du livre ici." : "Entrez les détails du nouveau livre ici."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const bookData = {
                title: formData.get("title") as string,
                author: formData.get("author") as string,
                isbn: formData.get("isbn") as string,
                copies: Number.parseInt(formData.get("copies") as string, 10),
                imageUrl: formData.get("imageUrl") as string,
              }
              if (currentBook) {
                handleEditBook({ ...bookData, id: currentBook.id })
              } else {
                handleAddBook(bookData)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input id="title" name="title" defaultValue={currentBook?.title} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">
                  Auteur
                </Label>
                <Input id="author" name="author" defaultValue={currentBook?.author} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isbn" className="text-right">
                  ISBN
                </Label>
                <Input id="isbn" name="isbn" defaultValue={currentBook?.isbn} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="copies" className="text-right">
                  Exemplaires
                </Label>
                <Input
                  id="copies"
                  name="copies"
                  type="number"
                  defaultValue={currentBook?.copies}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  URL de l'image
                </Label>
                <Input id="imageUrl" name="imageUrl" defaultValue={currentBook?.imageUrl} className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{currentBook ? "Modifier" : "Ajouter"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

