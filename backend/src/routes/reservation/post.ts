import { app } from "../..";
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
            if (!req.body.copy_id || !req.body.final_date || !req.body.user_id) {
                throw new AppError(
                    "Missing required fields: copy_id, final_date, user_id.",
                    400,
                );
            }

            const today = new Date();
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 28);
            
            const finalDate = new Date(req.body.final_date);

            console.log(today);
            console.log(finalDate);
            console.log(maxDate);
            
            if (finalDate > maxDate) {
                throw new AppError("Final date must be within 28 days from today.", 400);
            }

            const validatedData = insertReservationSchema.parse(req.body);

            const [existingCopy] = await db
                .select()
                .from(copy)
                .where(eq(copy.id, validatedData.copy_id));
            if (!existingCopy) {
                throw new AppError("Copy not found.", 404, {
                    copy_id: validatedData.copy_id,
                });
            }

            if (existingCopy.is_reserved) {
                throw new AppError("This copy is already reserved.", 409, {
                    copy_id: validatedData.copy_id,
                });
            }

            await db.transaction(async (trx) => {
                const newReservation = await trx
                    .insert(reservation)
                    .values(validatedData)
                    .returning();
                await trx
                    .update(copy)
                    .set({ is_reserved: true })
                    .where(eq(copy.id, validatedData.copy_id));

                res.status(201).json({
                    message:
                        "Reservation successfully added and copy marked as reserved.",
                    newReservation,
                });
            });
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                typeof error["code"] === "string"
            ) {
                if (error["code"] === "23505") {
                    return next(
                        new AppError("This reservation already exists.", 409),
                    );
                } else if (error["code"] === "23503") {
                    return next(
                        new AppError("Invalid copy ID or user ID.", 400),
                    );
                }
            }
            if (error instanceof AppError) return next(error);
            next(
                new AppError("Error while adding the reservation.", 500, error),
            );
        }
    },
);
