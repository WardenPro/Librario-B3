import HistoryClient from "./HistoryClient"

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Historique des réservations</h1>
      <HistoryClient />
    </div>
  )
}

