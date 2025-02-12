import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import {
    reservation,
    insertReservationSchema,
} from "../../db/schema/reservation";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response } from "express";

app.post(
    "/reservations",
    checkTokenMiddleware,
    async (req: Request, res: Response) => {
        try {
            const validatedData = insertReservationSchema.parse(req.body);
            const newReservation = await db
                .insert(reservation)
                .values(validatedData)
                .returning();

            await db
                .update(copy)
                .set({ is_reserved: true })
                .where(sql`${copy.id} = ${validatedData.copy_id}`);

            res.status(201).json({
                message:
                    "Reservation successfully added and copy marked as reserved.",
                newReservation,
            });
        } catch (error) {
            console.error("Error while adding the reservation:", error);
            res.status(500).json({
                message: "Error while adding the reservation.",
                error,
            });
        }
    },
);
