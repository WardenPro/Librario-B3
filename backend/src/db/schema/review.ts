import { pgTable, serial, text, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { books } from "./book";
import { copy } from "./copy";
import { users } from "./users";

export const review = pgTable(
    "review",
    {
        id: serial().primaryKey().notNull(),
        description: text("description").notNull(),
        note: integer("note").notNull(),
        book_id: integer("book_id")
            .notNull()
            .references(() => books.id, { onDelete: "cascade" }),
        condition: integer("condition").notNull(),
        copy_id: integer("copy_id")
            .notNull()
            .references(() => copy.id, { onDelete: "set null" }),
        user_id: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
    },
    (table) => [unique().on(table.user_id, table.book_id)],
);

export const insertReviewSchema = createInsertSchema(review, {
    description: (schema) =>
        schema.description.max(2000, {
            message: "The description must be 2000 maximum.",
        }),
    note: (schema) =>
        schema.note
            .min(0, { message: "The minimum note is 0." })
            .max(5, { message: "The maximum note is 5." }),
    condition: (schema) =>
        schema.condition
            .min(0, { message: "The minimum note is 0." })
            .max(5, { message: "The maximum note is 5." }),
    book_id: (schema) => schema.book_id,
    user_id: (schema) => schema.user_id,
});

export const selectReviewSchema = createSelectSchema(review, {
    description: (schema) => schema.description,
    note: (schema) => schema.note,
    book_id: (schema) => schema.book_id,
    condition: (schema) => schema.condition,
    copy_id: (schema) => schema.copy_id,
    user_id: (schema) => schema.user_id,
});

export const updateReviewSchema = createInsertSchema(review, {
    description: (schema) =>
        schema.description
            .max(2000, { message: "The description must be 2000 maximum." })
            .optional(),
    note: (schema) =>
        schema.note
            .min(0, { message: "The minimum note is 0" })
            .max(5, { message: "The maximum note is 5" })
            .optional(),
    condition: (schema) =>
        schema.condition
            .min(0, { message: "The minimum note is 0." })
            .max(5, { message: "The maximum note is 5." })
            .optional(),
    book_id: (schema) => schema.book_id.optional(),
    user_id: (schema) => schema.user_id.optional(),
});
