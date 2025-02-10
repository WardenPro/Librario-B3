import BooksClient from "./BooksClient"

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Bienvenue sur WardenPro Librario</h1>
      <BooksClient />
    </div>
  )
}

