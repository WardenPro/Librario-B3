import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pgTable, text, json } from "drizzle-orm/pg-core";
import { z } from "zod";

export const library = pgTable("library", {
    name: text("name"),
    location: text("location"),
    phone: text("phone"),
    email: text("email"),
    openingHours: json("opening_hours"),
});

const openingHoursSchema = z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
});

export const insertLibrarySchema = createInsertSchema(library, {
    name: (schema) => schema.name,
    location: (schema) => schema.location,
    phone: (schema) => schema.phone,
    email: (schema) => schema.email.email(),
    openingHours: () => openingHoursSchema,
});

export const selectLibrarySchema = createSelectSchema(library, {
    name: (schema) => schema.name,
    location: (schema) => schema.location,
    phone: (schema) => schema.phone,
    email: (schema) => schema.email.email(),
    openingHours: () => openingHoursSchema,
});
