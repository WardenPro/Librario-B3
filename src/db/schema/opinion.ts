import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { books } from "./book";
import { users } from "./users";

export const review = pgTable("review", {
    id: serial().primaryKey().notNull(),
    description: text("description").notNull(),
    note: integer("note").notNull(),
    books_id: integer("books_id").notNull().references(() => books.id),
    books_name: integer("books_name").notNull().references(() => books.name),
    users_id: integer("user_id").notNull().references(() => users.id),
    users_last_name: integer("user_last_name").notNull().references(() => users.last_name),
    users_first_name: integer("user_first_name").notNull().references(() => users.first_name),
})

export const insertReviewSchema = createInsertSchema(review, {
    description: (schema) => schema.description.max(50, { message: "Must be 50 maximum." }),
    note: (schema) => schema.note,
    books_id: (schema) => schema.books_id,
    books_name: (schema) => schema.books_name,
    users_id: (schema) => schema.users_id,
    users_last_name: (schema) => schema.users_last_name,
    users_first_name: (schema) => schema.users_first_name,
});

export const selectReviewSchema = createSelectSchema(review, {
    description: (schema) => schema.description,
    note: (schema) => schema.note,
    books_id: (schema) => schema.books_id,
    books_name: (schema) => schema.books_name,
    users_id: (schema) => schema.users_id,
    users_last_name: (schema) => schema.users_last_name,
    users_first_name: (schema) => schema.users_first_name,
});

export const updateReviewSchema = createInsertSchema(review, {
    description: (schema) => schema.description.max(250, { message: "Must be 250 maximum." }).optional(),
    note: (schema) => schema.note.optional(),
    books_id: (schema) => schema.books_id.optional(),
    books_name: (schema) => schema.books_name.optional(),
    users_id: (schema) => schema.users_id.optional(),
    users_last_name: (schema) => schema.users_last_name.optional(),
    users_first_name: (schema) => schema.users_first_name.optional(),
})