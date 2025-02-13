import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import {
    reservation,
    insertReservationSchema,
} from "../../db/schema/reservation";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

app.post(
    "/reservations",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = insertReservationSchema.parse(req.body);
            const newReservation = await db
                .insert(reservation)
                .values(validatedData)
                .returning()
                .execute();

            await db
                .update(copy)
                .set({ is_reserved: true })
                .where(eq(copy.id, validatedData.copy_id))
                .execute();

            res.status(201).json({
                message:
                    "Reservation successfully added and copy marked as reserved.",
                newReservation,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(new AppError("Error while adding the reservation.", 500));
        }
    },
);
