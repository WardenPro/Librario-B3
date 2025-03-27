import express from "express";
import { startDatabase } from "./app/config/database";
import { logMessage, errorMessage } from "./app/utils/logger";
import { startScheduler } from "./app/services/scheduler";
import { errorHandler } from "./app/middlewares/errorHandler";
import { createAdmin } from "./app/config/create_default_admin";
import cors from "cors";
import { corsOptions } from "./app/config/cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { swaggerSpec } from "./app/docs/swagger";
import swaggerUi from "swagger-ui-express";

dotenv.config();
export const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
    throw new Error("NODE_ENV is not defined in environment variables.");
}

export const app = express();
const port = 3000;

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (NODE_ENV === "development") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

async function startServer() {
    try {
        await startDatabase();
        await createAdmin();

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
                req: req.originalUrl,
            });
        });

        app.use(errorHandler);

        app.listen(port, "0.0.0.0", () => {
            logMessage(`Server is running on http://localhost:${port}`);
        });

        startScheduler();
    } catch (error) {
        errorMessage("Error connecting to the database:", error);
        process.exit(1);
    }
}

startServer();
