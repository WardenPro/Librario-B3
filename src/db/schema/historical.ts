import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { books } from "./book";

export const historical = pgTable("historical", {
    id: serial().primaryKey().notNull(),
    date_read: timestamp("date_read").defaultNow().notNull(),
    book_id: integer("book_id")
        .notNull()
        .references(() => books.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
});

export const insertHistoricalSchema = createInsertSchema(historical, {
    date_read: (schema) => schema.date_read,
    book_id: (schema) => schema.book_id,
    user_id: (schema) => schema.user_id,
});

export const selectHistoricalSchema = createSelectSchema(historical, {
    date_read: (schema) => schema.date_read,
    book_id: (schema) => schema.book_id,
    user_id: (schema) => schema.user_id,
});

export const updateHistoricalSchema = createInsertSchema(historical, {
    date_read: (schema) => schema.date_read,
    book_id: (schema) => schema.book_id.optional(),
    user_id: (schema) => schema.user_id.optional(),
});
