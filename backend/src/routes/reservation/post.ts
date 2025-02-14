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

            const existingCopy = await db
                .select()
                .from(copy)
                .where(eq(copy.id, validatedData.copy_id))
                .execute();

            if (existingCopy.length === 0) {
                throw new AppError("Copy not found.", 404, {
                    copy_id: validatedData.copy_id,
                });
            }

            if (existingCopy[0].is_reserved) {
                throw new AppError("This copy is already reserved.", 409, {
                    copy_id: validatedData.copy_id,
                });
            }

            await db.transaction(async (trx) => {
                const newReservation = await trx
                    .insert(reservation)
                    .values(validatedData)
                    .returning()
                    .execute();

                await trx
                    .update(copy)
                    .set({ is_reserved: true })
                    .where(eq(copy.id, validatedData.copy_id))
                    .execute();

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
