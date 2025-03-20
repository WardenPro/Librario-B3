"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Copy = {
    copy_id: number;
    state: string;
    is_reserved: boolean;
    is_claimed: boolean;
    book_id: number;
    review_condition: string[] | null;
};

export default function CopyClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookId = searchParams.get("bookId");
    const bookTitle = searchParams.get("bookTitle");
    const [copies, setCopies] = useState<Copy[]>([]);

    useEffect(() => {
        if (!bookId) return;

        const fetchCopies = async () => {
            try {
                const response = await fetch(`/api/books/${bookId}/copy`, {
                    headers: {
                        "auth_token": `${localStorage.getItem("auth_token")}`
                    }
                });
                if (response.ok) {
                    const data: Copy[] = await response.json();
                    setCopies(data);
                } else {
                    console.error("Erreur lors du fetch des copies :", response.statusText);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des copies :", error);
            }
        };
        fetchCopies();
    }, [bookId]);

    return (
        <div className="container mx-auto p-6">
            <Button onClick={() => router.push("/books")} className="mb-4">
                Retour aux livres
            </Button>
            <h1 className="text-2xl font-bold mb-4">Copies de {bookTitle}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {copies.length > 0 ? (
                    copies.map((copy) => (
                        <div key={copy.copy_id} className="border p-4 rounded-lg shadow-md">
                            <p><strong>État :</strong> {copy.state}</p>
                            <p><strong>Réservé :</strong> {copy.is_reserved ? "Oui" : "Non"}</p>
                            <p><strong>Réclamé :</strong> {copy.is_claimed ? "Oui" : "Non"}</p>
                            {copy.review_condition && (
                                <p><strong>Condition des avis :</strong> {copy.review_condition.join(", ")}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Aucune copie disponible pour ce livre.</p>
                )}
            </div>
        </div>
    );
}
