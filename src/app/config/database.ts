import { drizzle } from "drizzle-orm/mysql2";
import "dotenv/config";
import { logMessage, errorMessage } from "../services/log";
import dotenv from "dotenv";
import fs from "fs";

export let db: ReturnType<typeof drizzle>;

export async function startDatabase() {
    let DATABASE_URL;
    try {
        if (process.env.IS_PRODUCTION === "true") {
            console.log("babz");
            DATABASE_URL = fs.readFileSync("/run/secrets/database_url", "utf8").trim();
        } else {
            dotenv.config();
            DATABASE_URL = process.env.DATABASE_URL;
        }
        if (!DATABASE_URL) {
            throw new Error("Database url manquantes dans les secrets");
        }
    } catch (err) {
        throw new Error("Impossible de lire le secret : " + err);
    }

    if (!DATABASE_URL) {
        errorMessage("DATABASE_URL is not defined in environment variables.");
        throw new Error("DATABASE_URL is required.");
    }

    db = drizzle({ connection: { uri: DATABASE_URL! } });

    try {
        await db.execute("select 1");
        logMessage("Connected to the database.");
    } catch (error) {
        errorMessage("Error connecting to database:", error);
        throw error;
    }
}