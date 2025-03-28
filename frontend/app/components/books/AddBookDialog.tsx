"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type AddBookDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddBookDialog = ({ isOpen, onOpenChange }: AddBookDialogProps) => {
  const [importMode, setImportMode] = useState<"isbn" | "manual">("isbn");
  const [importError, setImportError] = useState<string | null>(null);
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [copyStates, setCopyStates] = useState<string[]>(["new"]);
  const router = useRouter();

  useEffect(() => {
    setCopyStates(Array(manualQuantity).fill("new"));
  }, [manualQuantity, importMode]);

  // Fonction pour gérer l'import via ISBN
  const handleImportSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isbn = formData.get("isbn") as string;
    const quantity = Number(formData.get("quantity"));
    const payload = { isbn, quantity, state: "new", copies: copyStates };

    try {
      const response = await fetch("/api/books/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          auth_token: `${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erreur lors de l'import via ISBN");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  // Fonction pour gérer l'import manuel
  const handleManualSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bookData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      printType: formData.get("printType") as string,
      category: formData.get("category") as string,
      publisher: formData.get("publisher") as string,
      author: formData.get("author") as string,
      quantity: Number(formData.get("quantity")),
      publish_date: formData.get("publish_date") as string,
      pages: Number(formData.get("pages")),
      language: formData.get("language") as string,
      ISBN_10: formData.get("ISBN_10") as string,
      ISBN_13: formData.get("ISBN_13") as string,
      image_link: formData.get("image_link") as string,
      copies: copyStates,
    };

    try {
      const response = await fetch("/api/books/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          auth_token: `${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(bookData),
      });
      if (!response.ok) throw new Error("Erreur lors de l'import manuel");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-xl font-bold mb-2">
            {importMode === "isbn" ? "Importer via ISBN" : "Import manuel"}
          </h2>
          {importError && <p className="text-red-500">{importError}</p>}
        </DialogHeader>
        {importMode === "isbn" ? (
          <form onSubmit={handleImportSubmit} className="grid gap-4 py-4">
            <div className="flex flex-col">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" name="isbn" type="text" required />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                required
                defaultValue={1}
                min={1}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  setManualQuantity(qty);
                }}
              />
            </div>
            {/* Champs dynamiques pour définir l'état de chaque copie */}
            {copyStates.map((copyState, index) => (
              <div key={index} className="flex flex-col">
                <Label htmlFor={`copyState-${index}`}>État de la copie {index + 1}</Label>
                <Input
                  id={`copyState-${index}`}
                  name={`copyState-${index}`}
                  type="text"
                  value={copyStates[index]}
                  onChange={(e) => {
                    const newStates = [...copyStates];
                    newStates[index] = e.target.value;
                    setCopyStates(newStates);
                  }}
                  required
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="submit">Importer via ISBN</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImportMode("manual");
                  setImportError(null);
                }}
              >
                Import manuel
              </Button>
            </div>
          </form>
        ) : (
          // Formulaire d'import manuel
          <div className="max-h-96 overflow-y-auto">
            <form onSubmit={handleManualSubmit} className="grid gap-4 py-4">
              <div className="flex flex-col">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="author">Auteur</Label>
                <Input id="author" name="author" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="printType">Type d'impression</Label>
                <Input id="printType" name="printType" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="category">Catégorie</Label>
                <Input id="category" name="category" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="publisher">Éditeur</Label>
                <Input id="publisher" name="publisher" type="text" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="pages">Nombre de pages</Label>
                <Input id="pages" name="pages" type="number" required min={1} />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="language">Langue</Label>
                <Input id="language" name="language" type="text" required placeholder="Ex: FR / EN / ES" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="publish_date">Date de publication</Label>
                <Input id="publish_date" name="publish_date" type="date" required />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="ISBN_10">ISBN-10 (optionnel)</Label>
                <Input id="ISBN_10" name="ISBN_10" type="text" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="ISBN_13">ISBN-13 (optionnel)</Label>
                <Input id="ISBN_13" name="ISBN_13" type="text" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="image_link">Lien de l'image (optionnel)</Label>
                <Input id="image_link" name="image_link" type="text" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  defaultValue={1}
                  min={1}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setManualQuantity(qty);
                  }}
                />
              </div>
              {/* Champs dynamiques pour définir l'état de chaque copie */}
              {copyStates.map((copyState, index) => (
                <div key={index} className="flex flex-col">
                  <Label htmlFor={`copyState-${index}`}>État de la copie {index + 1}</Label>
                  <Input
                    id={`copyState-${index}`}
                    name={`copyState-${index}`}
                    type="text"
                    value={copyStates[index]}
                    onChange={(e) => {
                      const newStates = [...copyStates];
                      newStates[index] = e.target.value;
                      setCopyStates(newStates);
                    }}
                    required
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="submit">Ajouter le livre</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportMode("isbn");
                    setImportError(null);
                  }}
                >
                  Retour
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};