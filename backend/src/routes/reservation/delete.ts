import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { reservation } from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.delete(
    "/reservations/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0)
                throw new AppError("Invalid reservation ID provided.", 400);

            const reservedCopy = await db
                .select({ copy_id: copy.id })
                .from(reservation)
                .where(eq(reservation.id, id));
            if (reservedCopy.length === 0) {
                throw new AppError("Copy not found.", 404, { id: id });
            }

            const deletedReservation = await db
                .delete(reservation)
                .where(eq(reservation.id, id))
                .returning();
            await db
                .update(copy)
                .set({ is_reserved: false })
                .where(eq(copy.id, reservedCopy[0].copy_id));

            res.status(200).json({
                message: "Reservation successfully deleted.",
                deletedReservation,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError(
                    "Error while deleting the reservation.",
                    500,
                    error,
                ),
            );
        }
    },
);
