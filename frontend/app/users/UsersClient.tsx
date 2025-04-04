"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: "admin" | "user";
  created_at: string;
  bio: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            "auth_token": `${localStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Erreur lors de la suppression de l'utilisateur");
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  const handleUserClick = (id: number) => {
    router.push(`/user-history/${id}`);
  };

  if (loading) return <p>Chargement des utilisateurs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} onClick={() => handleUserClick(user.id)} className="cursor-pointer">
              <TableCell>{user.first_name} {user.last_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.roles}</TableCell>
              <TableCell>{user.bio}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}>
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
