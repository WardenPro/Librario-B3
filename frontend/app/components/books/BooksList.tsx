"use client";

import { useState, useEffect } from "react";
import { BookCard } from "./BookCard";
import { Button } from "@/components/ui/button";
import { Book, Pagination } from "./types";
import { Plus } from "lucide-react";
import { AddBookDialog } from "./AddBookDialog";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";
import { useSearchParams } from "next/navigation";

export const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const fetchWithAuth = useApiErrorHandler();
  const searchParams = useSearchParams();

  const itemsPerPage = 30;

  useEffect(() => {
    let isMounted = true;
    
    const fetchBooks = async () => {
      try {
        const response = await fetchWithAuth(
          `/api/books?page=${currentPage}&itemsPerPage=${itemsPerPage}`,
          {
            headers: {
              auth_token: `${localStorage.getItem("auth_token")}`,
            },
          }
        );
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          setBooks(data.data);
          setPagination(data.pagination);
        } else {
          console.error("Erreur lors du fetch des livres :", response.statusText);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erreur lors de la récupération des livres :", error);
        }
      }
    };
    
    // Ne charger les livres que si aucun bookId n'est présent dans l'URL
    if (!searchParams.get('bookId')) {
      fetchBooks();
    }
    
    return () => {
      isMounted = false;
    };
  }, [currentPage, fetchWithAuth, itemsPerPage, searchParams]);

  // Si un bookId est présent dans l'URL, ne pas afficher la liste
  if (searchParams.get('bookId')) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAddBookDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un livre
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {pagination && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <Button
              variant="outline"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Précédent
            </Button>
            <span>
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      <AddBookDialog 
        isOpen={isAddBookDialogOpen}
        onOpenChange={setIsAddBookDialogOpen}
      />
    </>
  );
};