import UsersClient from "./UsersClient"

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
      <UsersClient />
    </div>
  )
}

