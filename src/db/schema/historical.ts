import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { books } from "./book";

export const historical = pgTable("historical", {
    id: serial().primaryKey().notNull(),
    date_read: timestamp("date_read", { withTimezone: true })
    .defaultNow()
    .notNull(),
    books_id: integer("books_id").notNull().references(() => books.id),
    users_id: integer("user_id").notNull().references(() => users.id),
})

export const insertHistoricalSchema = createInsertSchema(historical, {
    date_read: (schema) => schema.date_read,
    books_id: (schema) => schema.books_id,
    users_id: (schema) => schema.users_id,
});

export const selectHistoricalSchema = createSelectSchema(historical, {
    date_read: (schema) => schema.date_read,
    books_id: (schema) => schema.books_id,
    users_id: (schema) => schema.users_id,
});

export const updateHistoricalSchema = createInsertSchema(historical, {
    date_read: (schema) => schema.date_read,
    books_id: (schema) => schema.books_id.optional(),
    users_id: (schema) => schema.users_id.optional(),
});
