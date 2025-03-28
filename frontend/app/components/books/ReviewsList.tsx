"use client";

import { useState, useEffect } from "react";
import { Review } from "./types";
import { ReviewCard } from "./ReviewCard";

type ReviewsListProps = {
  bookId: string;
};

export const ReviewsList = ({ bookId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si pas de bookId, ne rien faire
    if (!bookId) return;
    
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/${bookId}/reviews`, {
          headers: {
            auth_token: `${localStorage.getItem("auth_token")}`,
          },
        });
        
        // Vérifier si le composant est toujours monté
        if (!isMounted) return;
        
        if (response.ok) {
          const data: Review[] = await response.json();
          
          // Récupérer les informations des utilisateurs pour chaque avis
          const reviewsWithUserInfo = await Promise.all(
            data.map(async (review) => {
              try {
                const userResponse = await fetch(`/api/users/${review.user_id}`, {
                  headers: {
                    auth_token: `${localStorage.getItem("auth_token")}`,
                  },
                });
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  
                  return {
                    ...review,
                    user: {
                      first_name: userData.first_name || "Inconnu",
                      last_name: userData.last_name || "Inconnu",
                    },
                  };
                }
              } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur:", error);
              }
              return {
                ...review,
                user: {
                  first_name: "Inconnu",
                  last_name: "Inconnu",
                },
              };
            })
          );
          
          // Vérifier à nouveau si le composant est monté avant de mettre à jour l'état
          if (isMounted) {
            setReviews(reviewsWithUserInfo);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erreur lors de la récupération des avis:", error);
          setError("Erreur lors de la récupération des avis");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    
    // Fonction de nettoyage pour éviter les mises à jour d'état après démontage
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  if (loading) {
    return <div className="text-center py-4">Chargement des avis...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">
        Avis sur le livre ({reviews.length})
      </h2>
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucun avis pour ce livre pour le moment.
        </div>
      )}
    </div>
  );
};