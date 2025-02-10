import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card text-card-foreground rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion à WardenPro Librario</h1>
        <LoginForm />
      </div>
    </div>
  )
}

