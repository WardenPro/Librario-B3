import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { copy } from "./copy";

export const reservation = pgTable("reservation", {
    id: serial().primaryKey().notNull(),
    reservation_date: timestamp("reservation_date", { withTimezone: true })
            .defaultNow()
            .notNull(),
    final_date: timestamp("final_date", { withTimezone: true })
            .notNull(),
    user_id: integer("user_id").notNull().references(() => users.id),
    copy_id: integer("copy_id").notNull().references(() => copy.id),
})

export const insertReservationSchema = createInsertSchema(reservation, {
    reservation_date: (schema) => schema.reservation_date,
    final_date: (schema) => schema.final_date,
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
    reservation_date: (schema) => schema.reservation_date.optional(),
    final_date: (schema) => schema.final_date.optional(),
    user_id: (schema) => schema.user_id.optional(),
    copy_id: (schema) => schema.copy_id.optional(), 
})