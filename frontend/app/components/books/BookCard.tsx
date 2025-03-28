"use client";

import { Book } from "./types";
import Image from "next/image";
import { useRouter } from "next/navigation";

type BookCardProps = {
  book: Book;
};

export const BookCard = ({ book }: BookCardProps) => {
  const router = useRouter();

  return (
    <div
      className="w-48 bg-card text-card-foreground rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => {
        router.push(`/books?bookId=${book.id}`);
      }}
    >
      <div className="relative w-full h-60">
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
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-1">par {book.author}</p>
        <p className="text-sm text-muted-foreground mb-1">
          Nombre de pages: {book.pageCount}
        </p>
        <p className="text-sm text-muted-foreground mb-1">
          Langue: {book.language}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Exemplaires: {book.quantity}
        </p>
      </div>
    </div>
  );
};