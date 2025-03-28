"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type UserHistory = {
    id: number;
    date_read: string;
    book_title: string;
    user_first_name: string;
    user_last_name: string;
};

type Props = {
    userId: string;
};

export default function UserHistoryClient({ userId }: Props) {
    const [history, setHistory] = useState<UserHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchWithAuth = useApiErrorHandler();

    useEffect(() => {
        const fetchUserHistory = async () => {
            try {
                const response = await fetchWithAuth(
                    `/api/users/${userId}/historical`,
                    {
                        method: "GET",
                        headers: {
                            auth_token: `${localStorage.getItem("auth_token")}`,
                        },
                    }
                );

                if (!response.ok)
                    throw new Error("Erreur lors de la récupération de l'historique");

                const data: UserHistory[] = await response.json();
                setHistory(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        };

        fetchUserHistory();
    }, [userId, fetchWithAuth]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "Date manquante";

        const normalized = dateString.includes(" ")
            ? dateString.replace(" ", "T")
            : dateString;

        const date = new Date(normalized);

        return isNaN(date.getTime())
            ? "Date invalide"
            : format(date, "dd-MM-yyyy", { locale: fr });
    };

    if (loading) return <p>Chargement de l'historique...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">
                Historique des lectures pour{" "}
                {history[0]?.user_first_name} {history[0]?.user_last_name}
            </h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre du Livre</TableHead>
                        <TableHead>Date de lecture</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.book_title}</TableCell>
                            <TableCell>
                                {item.date_read ? formatDate(item.date_read) : "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
