import { app } from "./app/index";
import { startDatabase } from "./app/config/database";
import { logMessage, errorMessage } from "./app/services/log";

const port = 3000;
async function startServer() {
    try {
        await startDatabase();
        await import("./routes/users/index");
        await import("./routes/book/index");
        await import("./routes/copy/index");
        await import("./routes/historical/index");
        await import("./routes/reservation/index");
        await import("./routes/review/index");

        app.listen(port, "0.0.0.0", () => {
            logMessage(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        errorMessage(
            "Erreur lors de la connexion à la base de données :",
            error,
        );
    }
}

startServer();
