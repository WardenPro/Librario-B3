import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { books } from "./book";

export const copy = pgTable("copy", {
    id: integer("id").primaryKey().notNull(),
    state: text("state").notNull(),
    is_reserved: boolean("is_reserved").notNull(),
    is_claimed: boolean("is_claimed").notNull(),
    book_id: integer("book_id")
        .notNull()  
        .references(() => books.id, { onDelete: "cascade" }),
});

export const insertCopySchema = createInsertSchema(copy, {
    state: (schema) =>
        schema.state
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),

    is_reserved: (schema) => schema.is_reserved,
    is_claimed: (schema) => schema.is_claimed,
    book_id: (schema) => schema.book_id,
});

export const selectCopySchema = createSelectSchema(copy, {
    state: (schema) => schema.state,
    is_reserved: (schema) => schema.is_reserved,
    is_claimed: (schema) => schema.is_claimed,
    book_id: (schema) => schema.book_id,
});

export const updateCopySchema = createInsertSchema(copy, {
    state: (schema) => schema.state.optional(),
    is_reserved: (schema) => schema.is_reserved.optional(),
    is_claimed: (schema) => schema.is_claimed.optional(),
    book_id: (schema) => schema.book_id.optional(),
});
