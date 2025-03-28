"use client";

import { useState, useEffect } from "react";
import { Copy } from "./types";
import { CopyCard } from "./CopyCard";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";

type CopiesListProps = {
  bookId: string;
};

export const CopiesList = ({ bookId }: CopiesListProps) => {
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const fetchWithAuth = useApiErrorHandler();

  useEffect(() => {
    if (!bookId || dataFetched) return;
    
    let isMounted = true;
    
    const fetchCopies = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/books/${bookId}/copy`, {
          headers: {
            auth_token: `${localStorage.getItem("auth_token")}`,
          },
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data: Copy[] = await response.json();
          setCopies(data);
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

    fetchCopies();
    
    return () => {
      isMounted = false;
    };
  }, [bookId, fetchWithAuth, dataFetched]);

  const handleDeleteCopy = async (copyId: number) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette copie ?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/copy/${copyId}`, {
        method: "DELETE",
        headers: {
          auth_token: `${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        setCopies((prev) => prev.filter((copy) => copy.copy_id !== copyId));
        console.log("Copie supprimée avec succès");
      } else {
        const data = await response.json();
        alert(data.message || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la copie:", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des exemplaires...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Exemplaires disponibles ({copies.length})
      </h2>

      {copies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {copies.map((copy) => (
            <CopyCard key={copy.copy_id} copy={copy} onDelete={handleDeleteCopy} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucun exemplaire disponible pour ce livre.
        </div>
      )}
    </div>
  );
};