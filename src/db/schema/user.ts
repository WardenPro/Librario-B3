import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    mysqlEnum,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
    id: int().autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    comment: varchar("comment", { length: 255 }),
    roles: mysqlEnum("roles", ["user", "admin"]).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    revocation_time_at: timestamp("revocation_time_at"),
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

// Créez d'abord le schéma de sélection complet
const fullSelectUserSchema = createSelectSchema(users, {
    id: (schema) => schema.id.positive(),
    name: (schema) => schema.name.toLowerCase(),
    email: (schema) => schema.email.email(),
    roles: (schema) => schema.roles,
});

// Excluez le champ `password` du schéma de sélection
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