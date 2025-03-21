"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";

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

type Pagination = {
  total: number;
  page: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<Copy | null>(null);
  const fetchWithAuth = useApiErrorHandler();

  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const itemsPerPage = 30;

  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  useEffect(() => {
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
        if (response.ok) {
          const data = await response.json();
          setBooks(data.data);
          setPagination(data.pagination);
        } else {
          console.error("Erreur lors du fetch des livres :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      }
    };
    fetchBooks();
  }, [currentPage]);

  useEffect(() => {
    const fetchBookDetails = async (id: string) => {
      try {
        const bookResponse = await fetchWithAuth(`/api/books/${id}`, {
          headers: {
            auth_token: `${localStorage.getItem("auth_token")}`,
          },
        });
        if (bookResponse.ok) {
          const bookData = await bookResponse.json();
          setSelectedBook(bookData);
        } else {
          setError("Erreur lors de la récupération des détails du livre");
        }
      } catch (error) {
        setError("Erreur lors de la connexion au serveur");
      }
    };

    const fetchCopies = async (id: string) => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/books/${id}/copy`, {
          headers: {
            auth_token: `${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data: Copy[] = await response.json();
          setCopies(data);
        } else {
          setError("Erreur lors de la récupération des exemplaires");
        }
      } catch (error) {
        setError("Erreur lors de la connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetails(bookId);
      fetchCopies(bookId);
    } else {
      setSelectedBook(null);
      setCopies([]);
    }
  }, [bookId]);

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "bon":
      case "good":
        return "bg-blue-100 text-blue-800";
      case "moyen":
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "mauvais":
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReservationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCopy) return;
    const payload = {
      copy_id: selectedCopy.copy_id,
      user_id: Number(userId),
      reservation_date: startDate,
      final_date: endDate,
    };

    try {
      const response = await fetchWithAuth("/api/reservations", {
        method: "POST",
        headers: {
          auth_token: `${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Réservation créée avec succès");
        setReservationDialogOpen(false);
        setCopies((prev) =>
          prev.map((copy) =>
            copy.copy_id === selectedCopy.copy_id ? { ...copy, is_reserved: true } : copy
          )
        );
      } else {
        console.error("Erreur lors de la création de la réservation:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy", { locale: fr });
  };

  if (bookId) {
    return (
      <div className="container mx-auto py-6">
        <Button
          variant="ghost"
          className="mb-4 flex items-center"
          onClick={() => router.push("/books")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux livres
        </Button>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {selectedBook && (
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/4 flex-shrink-0">
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={selectedBook.image_link || "/placeholder.svg"}
                  alt={`Couverture de ${selectedBook.title}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="w-full md:w-3/4">
              <h1 className="text-2xl font-bold mb-2">{selectedBook.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">par {selectedBook.author}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ISBN-10: {selectedBook.ISBN_10 || "N/A"}</p>
                  <p className="text-sm text-muted-foreground mb-1">ISBN-13: {selectedBook.ISBN_13 || "N/A"}</p>
                  <p className="text-sm text-muted-foreground mb-1">Éditeur: {selectedBook.publisher}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date de publication: {formatDate(selectedBook.publish_date)}</p>
                  <p className="text-sm text-muted-foreground mb-1">Catégorie: {selectedBook.category}</p>
                  <p className="text-sm text-muted-foreground mb-1">Type: {selectedBook.printType}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-sm">{selectedBook.description}</p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">
          Exemplaires disponibles ({copies.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">Chargement des exemplaires...</div>
        ) : copies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {copies.map((copy) => (
              <Card key={copy.copy_id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                      copy.state
                    )}`}
                  >
                    État: {copy.state}
                  </span>
                  <div className="flex gap-2">
                    {copy.is_reserved && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        Réservé
                      </Badge>
                    )}
                    {copy.is_claimed && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-300"
                      >
                        Réclamé
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-2">
                  ID exemplaire: #{copy.copy_id}
                </p>
                {copy.review_condition &&
                  copy.review_condition.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-1">
                        Évaluations de l'état:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {copy.review_condition.map(
                          (condition, index) =>
                            condition &&
                            condition !== "null" && (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {condition}
                              </Badge>
                            )
                        )}
                      </div>
                    </div>
                  )}

                { }
                {!copy.is_reserved && (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setSelectedCopy(copy);
                      setReservationDialogOpen(true);
                    }}
                  >
                    Réserver cette copie
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun exemplaire disponible pour ce livre.
          </div>
        )}

        { }
        <Dialog
          open={reservationDialogOpen}
          onOpenChange={setReservationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Réserver l'exemplaire #{selectedCopy?.copy_id}
              </DialogTitle>
              <DialogDescription>
                Entrez l'ID de l'utilisateur ainsi que les dates de début et de fin
                de la réservation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReservationSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReservationDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Confirmer la réservation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => console.log("Ouvrir le dialog pour ajouter un livre")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un livre
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="w-48 bg-card text-card-foreground rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => router.push(`?bookId=${book.id}`, { scroll: false })}
          >
            <div className="relative w-full h-60">
              <Image
                src={book.image_link || "/placeholder.svg"}
                alt={`Couverture de ${book.title}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">par {book.author}</p>
              <p className="text-sm text-muted-foreground mb-1">
                ISBN-10: {book.ISBN_10 || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                ISBN-13: {book.ISBN_13 || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Exemplaires: {book.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      { }
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
  );
}
