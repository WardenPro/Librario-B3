"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

type Book = {
  id: number;
  title: string;
  author: string;
  ISBN_10: string | null;
  ISBN_13: string | null;
  description: string;
  printType: string;
  category: string;
  publisher: string;
  quantity: number;
  publish_date: string;
  image_link: string | null;
};

type Copy = {
  copy_id: number;
  state: string;
  is_reserved: boolean;
  is_claimed: boolean;
  book_id: number;
  review_condition: string[] | null;
};

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books", {
          headers: {
            "auth_token": `${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data: Book[] = await response.json();
          setBooks(data);
        } else {
          console.error("Erreur lors du fetch des livres :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      }
    };
    fetchBooks();
  }, []);

  // Fonction pour récupérer les copies d'un livre
  const fetchCopies = async (bookId: number) => {
    try {
      const response = await fetch(`/api/copy/book/${bookId}`, {
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data: Copy[] = await response.json();
        setCopies(data);
        setIsCopyDialogOpen(true);
      } else {
        console.error("Erreur lors du fetch des copies :", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des copies :", error);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un livre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedBook(book);
              fetchCopies(book.id);
            }}
          >
            <div className="aspect-w-2 aspect-h-3 relative">
              <Image
                src={book.image_link || "/placeholder.svg"}
                alt={`Couverture de ${book.title}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">par {book.author}</p>
              <p className="text-sm text-muted-foreground mb-1">ISBN-10: {book.ISBN_10 || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-1">ISBN-13: {book.ISBN_13 || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-4">Exemplaires: {book.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour afficher les copies du livre sélectionné */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copies de {selectedBook?.title}</DialogTitle>
            <DialogDescription>Voici les copies disponibles pour ce livre.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {copies.length > 0 ? (
              copies.map((copy) => (
                <div key={copy.copy_id} className="border p-3 rounded-lg shadow-sm">
                  <p>
                    <strong>État :</strong> {copy.state}
                  </p>
                  <p>
                    <strong>Réservé :</strong> {copy.is_reserved ? "Oui" : "Non"}
                  </p>
                  <p>
                    <strong>Réclamé :</strong> {copy.is_claimed ? "Oui" : "Non"}
                  </p>
                  {copy.review_condition && (
                    <p>
                      <strong>Condition des avis :</strong> {copy.review_condition.join(", ")}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>Aucune copie disponible pour ce livre.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsCopyDialogOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
