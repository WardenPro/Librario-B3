"use client"

import { useEffect, useState } from "react"
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

// Fonction pour récupérer les livres depuis l'API
const fetchBooks = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/books", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajoute le token JWT si nécessaire
      },
    })
    if (!response.ok) throw new Error("Erreur lors de la récupération des livres")
    return await response.json()
  } catch (error) {
    console.error("Erreur lors du fetch des livres :", error)
    return []
  }
}

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchBooks().then(setBooks)
  }, [])

  const handleAddBook = async (newBook: Omit<Book, "id">) => {
    try {
      const response = await fetch("api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          auth_token: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newBook),
      })
      if (!response.ok) throw new Error("Erreur lors de l'ajout du livre")
      const addedBook = await response.json()
      setBooks([...books, addedBook])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre :", error)
    }
  }

  const handleDeleteBook = async (id: number) => {
    try {
      await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: {
          auth_token: `${localStorage.getItem("token")}`,
        },
      })
      setBooks(books.filter((book) => book.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression du livre :", error)
    }
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
    </>
  )
}
