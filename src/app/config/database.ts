import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { logMessage, errorMessage } from "../services/log";
import dotenv from "dotenv";
import "dotenv/config";

export let db: ReturnType<typeof drizzle>;

export async function startDatabase() {
    let DATABASE_URL;
    dotenv.config();
    try {
        DATABASE_URL = process.env.DATABASE_URL;
    } catch (err) {
        throw new Error("Impossible de lire le secret : " + err);
    }

    if (!DATABASE_URL) {
        errorMessage("DATABASE_URL is not defined in environment variables.");
        throw new Error("DATABASE_URL is not defined in environment variables.");
    }

    setTimeout(() => {
        db = drizzle(DATABASE_URL);
    }, 15000);

    try {
        await db.execute("select 1");
        logMessage("Connected to the database.");
    } catch (error) {
        errorMessage("Error connecting to database:", error);
        throw error;
    }

    await migrate(db, { migrationsFolder: "drizzle" });
}