import {
    pgTable,
    serial,
    text,
    timestamp,
    integer,
    boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const books = pgTable("books", {
    id: serial().primaryKey().notNull(),
    isbn: integer("isbn").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(),
    category: text("category").notNull(),
    publisher: text("publisher").notNull(),
    author: text("author").notNull(),
    quantity: integer("quantity").notNull().default(1),
    publish_date: timestamp("publish_date").defaultNow().notNull(),
    image_link: text("image_link"),
    is_removed: boolean("is_removed").notNull().default(false),
});

export const insertBookSchema = createInsertSchema(books, {
    name: (schema) => schema.name,
    description: (schema) => schema.description,
    type: (schema) => schema.type,
    category: (schema) => schema.category,
    publisher: (schema) => schema.publisher,
    author: (schema) => schema.author,
    quantity: (schema) => schema.quantity,
    publish_date: (schema) => schema.publish_date,
    image_link: (schema) => schema.image_link,
});

export const SelectBookSchema = createSelectSchema(books, {
    name: (schema) => schema.name,
    description: (schema) => schema.description,
    type: (schema) => schema.type,
    category: (schema) => schema.category,
    publisher: (schema) => schema.publisher,
    author: (schema) => schema.author,
    quantity: (schema) => schema.quantity,
    publish_date: (schema) => schema.publish_date,
    image_link: (schema) => schema.image_link,
});

export const updateBookSchema = createInsertSchema(books, {
    quantity: (schema) =>
        schema.quantity.min(0, "Quantity must be a positive number"),
});
