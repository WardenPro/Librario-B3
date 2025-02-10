import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./backend/drizzle",
    dialect: "postgresql",
    schema: "./backend/src/db/schema",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
