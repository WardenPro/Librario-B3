"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

type Book = {
  id: number
  title: string
  author: string
  isbn: string
  genre: string
  copies: number
  imageUrl: string
}

const booksData: Book[] = [
  {
    id: 1,
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    isbn: "9780156012195",
    genre: "Jeunesse",
    copies: 5,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Science-fiction",
    copies: 3,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    genre: "Science-fiction",
    copies: 2,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 4,
    title: "L'Étranger",
    author: "Albert Camus",
    isbn: "9780156278591",
    genre: "Philosophie",
    copies: 4,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
  {
    id: 5,
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    isbn: "9780747532743",
    genre: "Fantastique",
    copies: 6,
    imageUrl: "/placeholder.svg?height=150&width=100",
  },
]

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>(booksData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")

  const genres = Array.from(new Set(booksData.map((book) => book.genre)))

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === "" || book.genre === selectedGenre),
  )

  const handleReserve = (bookId: number) => {
    // Ici, vous feriez normalement un appel API pour réserver le livre
    console.log(`Livre réservé : ${bookId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un livre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-w-2 aspect-h-3 relative mb-4">
                <Image
                  src={book.imageUrl || "/placeholder.svg"}
                  alt={`Couverture de ${book.title}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-1">par {book.author}</p>
              <p className="text-sm text-muted-foreground mb-1">Genre: {book.genre}</p>
              <p className="text-sm text-muted-foreground mb-1">ISBN: {book.isbn}</p>
              <p className="text-sm text-muted-foreground mb-4">Exemplaires disponibles: {book.copies}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleReserve(book.id)} className="w-full">
                Réserver
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

