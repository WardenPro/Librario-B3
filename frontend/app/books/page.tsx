"use client";

import { useSearchParams } from "next/navigation";
import { BooksList } from "../components/books/BooksList";
import { BookDetails } from "../components/books/BookDetails";

export default function BooksPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  return (
    <>
      {bookId ? (
        <BookDetails bookId={bookId} />
      ) : (
        <BooksList />
      )}
    </>
  );
}