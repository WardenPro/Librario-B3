"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type Copy = {
    copy_id: number;
    state: string;
    is_reserved: boolean;
    is_claimed: boolean;
    book_id: number;
    review_condition: string[] | null;
};

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

export default function CopyClient() {
    const params = useParams();
    const bookId = params.id;
    const router = useRouter();
    const [copies, setCopies] = useState<Copy[]>([]);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`/api/books/${bookId}`, {
                    headers: {
                        "auth_token": `${localStorage.getItem("auth_token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBook(data);
                } else {
                    setError("Erreur lors de la récupération des détails du livre");
                }
            } catch (error) {
                setError("Erreur lors de la connexion au serveur");
                console.error("Erreur:", error);
            }
        };

        const fetchCopies = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/books/${bookId}/copy`, {
                    headers: {
                        "auth_token": `${localStorage.getItem("auth_token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCopies(data);
                } else {
                    setError("Erreur lors de la récupération des exemplaires");
                }
            } catch (error) {
                setError("Erreur lors de la connexion au serveur");
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };

        if (bookId) {
            fetchBookDetails();
            fetchCopies();
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

    return (
        <div className="container mx-auto py-6">
            <Button
                variant="ghost"
                className="mb-4 flex items-center"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux livres
            </Button>

            {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
                    {error}
                </div>
            )}

            {book && (
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="w-full md:w-1/4 flex-shrink-0">
                        <div className="aspect-w-2 aspect-h-3 relative h-64 md:h-80">
                            <Image
                                src={book.image_link || "/placeholder.svg"}
                                alt={`Couverture de ${book.title}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
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
                                <p className="text-sm text-muted-foreground mb-1">Date de publication: {book.publish_date}</p>
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
            )}

            <h2 className="text-xl font-bold mb-4">Exemplaires disponibles ({copies.length})</h2>

            {loading ? (
                <div className="text-center py-8">Chargement des exemplaires...</div>
            ) : copies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {copies.map((copy) => (
                        <Card key={copy.copy_id} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(copy.state)}`}>
                                    État: {copy.state}
                                </span>
                                <div className="flex gap-2">
                                    {copy.is_reserved && (
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                            Réservé
                                        </Badge>
                                    )}
                                    {copy.is_claimed && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                            Réclamé
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm mb-2">ID exemplaire: #{copy.copy_id}</p>
                            {copy.review_condition && copy.review_condition.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-medium mb-1">Évaluations de l'état:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {copy.review_condition.map((condition, index) => (
                                            condition && condition !== "null" && (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {condition}
                                                </Badge>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    Aucun exemplaire disponible pour ce livre.
                </div>
            )}
        </div>
    );
}