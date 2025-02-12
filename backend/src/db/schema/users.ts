import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const rolesEnum = pgEnum("roles", ["user", "admin"]);

export const users = pgTable("users", {
    id: serial().primaryKey().notNull(),
    last_name: text("last_name").notNull(),
    first_name: text("first_name").notNull(),
    password: text("password").notNull(),
    email: text("email").unique().notNull(),
    roles: rolesEnum("roles").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    revocation_time_at: timestamp("revocation_time_at"),
});

export const insertUserSchema = createInsertSchema(users, {
    last_name: (schema) =>
        schema.last_name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),
    first_name: (schema) =>
        schema.first_name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),
    email: (schema) => schema.email.email(),
    password: (schema) =>
        schema.password
            .min(8)
            .max(255)
            .regex(/^[a-zA-Z0-9!@#$%^&*]+$/),

    roles: (schema) => schema.roles,
});

const fullSelectUserSchema = createSelectSchema(users, {
    id: (schema) => schema.id.positive(),
    last_name: (schema) => schema.last_name.toLowerCase(),
    first_name: (schema) => schema.first_name.toLowerCase(),
    email: (schema) => schema.email.email(),
    roles: (schema) => schema.roles,
});

export const selectUserSchema = fullSelectUserSchema.omit({ password: true });

export const updateUserSchema = createInsertSchema(users, {
    last_name: (schema) =>
        schema.last_name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),
    first_name: (schema) =>
        schema.first_name
            .min(2, { message: "Must be 2 or more characters." })
            .max(50, { message: "Must be 50 maximum." })
            .regex(/^[a-zA-Z ]+$/, { message: "Must be only letters." }),
    email: (schema) => schema.email.email().optional(),
    password: (schema) =>
        schema.password
            .min(8)
            .max(255)
            .regex(/^[a-zA-Z0-9]+$/)
            .optional(),
    roles: (schema) => schema.roles.optional(),
});
