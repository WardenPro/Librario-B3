"use client";

import { useState, useEffect } from "react";
import { Book } from "./types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CopiesList } from "./CopiesList";
import { ReviewsList } from "./ReviewsList";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";

type BookDetailsProps = {
  bookId: string;
};

export const BookDetails = ({ bookId }: BookDetailsProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchWithAuth = useApiErrorHandler();

  useEffect(() => {
    if (!bookId || dataFetched) return;
    
    let isMounted = true;
    
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookResponse = await fetchWithAuth(`/api/books/${bookId}`, {
          headers: {
            auth_token: `${localStorage.getItem("auth_token")}`,
          },
        });
        
        if (!isMounted) return;
        
        if (bookResponse.ok) {
          const bookData = await bookResponse.json();
          setBook(bookData);
        } else {
          setError("Erreur lors de la récupération des détails du livre");
        }
      } catch (error) {
        if (isMounted) {
          setError("Erreur lors de la connexion au serveur");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setDataFetched(true);
        }
      }
    };

    fetchBookDetails();
    
    return () => {
      isMounted = false;
    };
  }, [bookId, fetchWithAuth, dataFetched]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy", { locale: fr });
  };

  if (loading) {
    return <div className="container mx-auto py-6">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          Livre non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => router.push("/books")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux livres
      </Button>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/4 flex-shrink-0">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <Image
              src={
                book.image_link
                  ? `data:image/jpeg;base64,${book.image_link}`
                  : "/placeholder.svg"
              }
              alt={`Couverture de ${book.title}`}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">par {book.author}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ISBN-10: {book.ISBN_10 || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-1">ISBN-13: {book.ISBN_13 || "N/A"}</p>
              <p className="text-sm text-muted-foreground mb-1">Éditeur: {book.publisher}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date de publication: {formatDate(book.publish_date)}</p>
              <p className="text-sm text-muted-foreground mb-1">Catégorie: {book.category}</p>
              <p className="text-sm text-muted-foreground mb-1">Type: {book.printType}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Description:</h3>
            <p className="text-sm">{book.description}</p>
          </div>
        </div>
      </div>

      <CopiesList bookId={bookId} />
      <ReviewsList bookId={bookId} />
    </div>
  );
};