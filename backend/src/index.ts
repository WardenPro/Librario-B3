import { app } from "./app/index";
import { startDatabase } from "./app/config/database";
import { logMessage, errorMessage } from "./app/utils/logger";
import { startScheduler } from "./app/services/scheduler";
import { errorHandler } from "./app/middlewares/errorHandler";
import { createAdmin } from "./app/config/create_default_admin";

const port = 3000;
async function startServer() {
    try {
        await startDatabase();
        createAdmin();
        await import("./routes/users/index");
        await import("./routes/book/index");
        await import("./routes/copy/index");
        await import("./routes/historical/index");
        await import("./routes/reservation/index");
        await import("./routes/review/index");
        await import("./routes/library/index");

        app.use((req, res) => {
            res.status(404).json({
                error: "This resource does not exist.",
            });
        });
        app.use(errorHandler);

        app.listen(port, "0.0.0.0", () => {
            logMessage(`Server is running on http://localhost:${port}`);
        });
        startScheduler();
    } catch (error) {
        errorMessage("Error connecting to the database:", error);
    }
}

startServer();
