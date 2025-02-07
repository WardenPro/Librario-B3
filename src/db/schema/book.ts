import {
    pgTable,
    serial,
    text,
    timestamp,
    integer,
    boolean,
    check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const books = pgTable(
    "books",
    {
        id: serial().primaryKey().notNull(),
        ISBN_10: text("ISBN_10"),
        ISBN_13: text("ISBN_13"),
        title: text("title").notNull(),
        description: text("description").notNull(),
        printType: text("type").notNull(),
        category: text("category").notNull(),
        publisher: text("publisher").notNull(),
        author: text("author").notNull(),
        quantity: integer("quantity").notNull().default(1),
        publish_date: timestamp("publish_date").defaultNow().notNull(),
        image_link: text("image_link"),
        is_removed: boolean("is_removed").notNull().default(false),
    },
    (table) => ({
        checkConstraint: check(
            "isbn_check",
            sql`${table.ISBN_10} IS NOT NULL OR ${table.ISBN_13} IS NOT NULL`,
        ),
    }),
);

export const insertBookSchema = createInsertSchema(books, {
    title: (schema) => schema.title,
    description: (schema) => schema.description,
    printType: (schema) => schema.printType,
    category: (schema) => schema.category,
    publisher: (schema) => schema.publisher,
    author: (schema) => schema.author,
    quantity: (schema) => schema.quantity,
    publish_date: (schema) => schema.publish_date,
    image_link: (schema) => schema.image_link,
});

export const SelectBookSchema = createSelectSchema(books, {
    title: (schema) => schema.title,
    ISBN_10: (schema) => schema.ISBN_10.nullable(),
    ISBN_13: (schema) => schema.ISBN_13.nullable(),
    description: (schema) => schema.description,
    printType: (schema) => schema.printType,
    category: (schema) => schema.category,
    publisher: (schema) => schema.publisher,
    author: (schema) => schema.author,
    quantity: (schema) => schema.quantity,
    publish_date: (schema) => schema.publish_date,
    image_link: (schema) => schema.image_link,
});

export const updateBookSchema = createInsertSchema(books, {
    title:      (schema) => schema.title.optional(),
    description:(schema) => schema.description.optional(),
    printType:  (schema) => schema.printType.optional(),
    category:   (schema) => schema.category.optional(),
    publisher:  (schema) => schema.publisher.optional(),
    author:     (schema) => schema.author.optional(),
    quantity: (schema) =>
        schema.quantity.min(0, "Quantity must be a positive number").optional(),
});
