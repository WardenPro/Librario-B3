import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const books = pgTable("books", {
    id: serial().primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(),
    category: text("category").notNull(),
    publisher: text("publisher").notNull(),
    author: text("author").notNull(),
    quantity: integer("quantity").notNull(),    
    publish_date: timestamp("publish_date", { withTimezone: true })
        .notNull(),
    image_link: text("image_link"),
})

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
    name: (schema) => schema.name.optional(),
    description: (schema) => schema.description.optional(),
    type: (schema) => schema.type.optional(),
    category: (schema) => schema.category.optional(),
    publisher: (schema) => schema.publisher.optional(),
    author: (schema) => schema.author.optional(),
    quantity: (schema) => schema.quantity.optional(),
    publish_date: (schema) => schema.publish_date.optional(),
    image_link: (schema) => schema.image_link.optional(),
});