import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";
const secretPath = "/run/secrets/database_url";
import fs from "fs";
import { logMessage, errorMessage } from "../services/log";

async function runMigrations() {
    let DATABASE_URL;

    try {
        DATABASE_URL = fs.readFileSync(secretPath, "utf8").trim();
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

    try {
        const connection = await mysql.createConnection(DATABASE_URL!);

        const db = drizzle(connection);

        logMessage("Exécution des migrations en cours...");

        await migrate(db, { migrationsFolder: "drizzle" });

        logMessage("Migrations terminées avec succès.");

        await connection.end();
        process.exit(0);
    } catch (error) {
        errorMessage("Erreur pendant l'exécution des migrations :", error);
        process.exit(1);
    }
}

runMigrations();