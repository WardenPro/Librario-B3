import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { logMessage, errorMessage } from "../services/log";
import dotenv from "dotenv";
import "dotenv/config";
import { NODE_ENV } from "..";

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
        throw new Error(
            "DATABASE_URL is not defined in environment variables.",
        );
    }

    if (NODE_ENV === "production")
        await new Promise(resolve => setTimeout(resolve, 15000));
    
    db = drizzle(DATABASE_URL);
    
    try {
        await db.execute("select 1");
        logMessage("Connected to the database.");
    } catch (error) {
        errorMessage("Error connecting to database:", error);
        throw error;
    }
    if (NODE_ENV === "production")
        await migrate(db, { migrationsFolder: "drizzle" });
}
