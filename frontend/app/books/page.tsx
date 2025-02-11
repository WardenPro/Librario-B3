import BooksClient from "./BooksClient"

export default function BooksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Gestion des livres</h1>
      <BooksClient />
    </div>
  )
}

