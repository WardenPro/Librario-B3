import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const rolesEnum = pgEnum("roles", ["user", "admin"]);

export const users = pgTable("users", {
    id: serial().primaryKey().notNull(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    email: text("email").unique().notNull(),
    comment: text("comment"),
    roles: rolesEnum("roles").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    revocation_time_at: timestamp("revocation_time_at", { withTimezone: true }),
});

export const insertUserSchema = createInsertSchema(users, {
    name: (schema) =>
        schema.name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),
    email: (schema) => schema.email.email(),
    password: (schema) =>
        schema.password
            .min(8)
            .max(255)
            .regex(/^[a-zA-Z0-9]+$/),
    roles: (schema) => schema.roles,
});

const fullSelectUserSchema = createSelectSchema(users, {
    id: (schema) => schema.id.positive(),
    name: (schema) => schema.name.toLowerCase(),
    email: (schema) => schema.email.email(),
    roles: (schema) => schema.roles,
});

export const selectUserSchema = fullSelectUserSchema.omit({ password: true });

export const updateUserSchema = createInsertSchema(users, {
    name: (schema) =>
        schema.name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." })
            .optional(),
    email: (schema) => schema.email.email().optional(),
    password: (schema) =>
        schema.password
            .min(8)
            .max(255)
            .regex(/^[a-zA-Z0-9]+$/)
            .optional(),
    comment: (schema) => schema.comment.max(255).optional(),
    roles: (schema) => schema.roles.optional(),
});
