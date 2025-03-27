"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Review = {
  id: number;
  description: string;
  note: number;
  book_id: number;
  condition: number;
  copy_id: number;
  user_id: number;
};

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "GET",
          headers: {
            "auth_token": `${localStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des évaluations");

        const data: Review[] = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };

    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de l'évaluation");

      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Livre</TableHead>
            <TableHead>ID Utilisateur</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.book_id}</TableCell>
              <TableCell>{review.user_id}</TableCell>
              <TableCell>{review.note}</TableCell>
              <TableCell>{review.condition}</TableCell>
              <TableCell>{review.description}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(review.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
