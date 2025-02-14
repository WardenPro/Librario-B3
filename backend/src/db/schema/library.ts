import { pgTable, text } from "drizzle-orm/pg-core";

export const library = pgTable("library", {
    name: text("name").notNull().default("Bibliothèque par défaut"),
});
