import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { copy } from "./copy";
import z from "zod";

export const reservation = pgTable("reservation", {
    id: serial().primaryKey().notNull(),
    reservation_date: timestamp("reservation_date").defaultNow().notNull(),
    final_date: timestamp("final_date").notNull(),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    copy_id: integer("copy_id")
        .notNull()
        .references(() => copy.id, { onDelete: "cascade" }),
});

export const insertReservationSchema = createInsertSchema(reservation, {
    reservation_date: z.coerce.date(),
    final_date: z.coerce.date(),
    user_id: (schema) => schema.user_id,
    copy_id: (schema) => schema.copy_id,
});

export const selectReservationSchema = createSelectSchema(reservation, {
    reservation_date: (schema) => schema.reservation_date,
    final_date: (schema) => schema.final_date,
    user_id: (schema) => schema.user_id,
    copy_id: (schema) => schema.copy_id,
});

export const updateReservationSchema = createInsertSchema(reservation, {
    reservation_date: z.coerce.date().optional(),
    final_date: z.coerce.date().optional(),
    user_id: (schema) => schema.user_id.optional(),
    copy_id: (schema) => schema.copy_id.optional(),
});
