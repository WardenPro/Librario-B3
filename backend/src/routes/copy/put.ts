import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { copy, updateCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { historical } from "../../db/schema/historical";
import { reservation } from "../../db/schema/reservation";
app.put(
    "/copy/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy ID provided.", 400);

            const [selectedCopy] = await db
                .select()
                .from(copy)
                .where(eq(copy.id, copyId));
            if (!selectedCopy)
                throw new AppError("Copy not found.", 404, { id: copyId });

            const validatedData = updateCopySchema.parse(req.body.state);
            const [updatedCopy] = await db
                .update(copy)
                .set(validatedData)
                .where(eq(copy.id, copyId))
                .returning();
            if (!updatedCopy)
                throw new AppError(
                    "Copy not found or no modifications applied.",
                    404,
                    { id: copyId },
                );

            res.status(200).json({
                message: "Copy successfully updated.",
                updatedCopy,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while updating the copy.", 500, error),
            );
        }
    },
);

app.put(
    "/copy/:id/claimed",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy ID provided.", 400);

            const [userReservation] = await db
                .select()
                .from(reservation)
                .where(eq(reservation.copy_id, copyId))
                .limit(1);
            if (!userReservation)
                throw new AppError("Reservation not found for this copy.", 404, {
                    id: copyId,
                });

            const [updatedCopy, newHistorical] = await db.transaction(async (trx) => {
                const [updatedCopy] = await trx
                .update(copy)
                .set({ is_claimed: true })
                .where(eq(copy.id, copyId))
                .returning();
            if (!updatedCopy)
                throw new AppError("Copy not found or already claimed.", 404, {
                    id: copyId,
                });
            
            const [newHistorical] = await trx.insert(historical).values({
                user_id: userReservation.user_id,
                book_id: updatedCopy.book_id,
                date_read: new Date(),
            }).returning();
            if (!newHistorical)
                    throw new AppError("Error while adding to historical.", 500);

                return [newHistorical, updatedCopy];
            });

            res.status(200).json({
                message: "Copy successfully claimed.",
                updatedCopy,
                newHistorical,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while claiming the copy.", 500, error),
            );
        }
    },
);

app.put(
    "/copy/:id/unclaimed",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy ID provided.", 400);

            const [userReservation] = await db
                .select()
                .from(reservation)
                .where(eq(reservation.copy_id, copyId))
                .limit(1);
            if (!userReservation)
                throw new AppError("Reservation not found for this copy.", 404, {
                    id: copyId,
                });

            const [updatedCopy] = await db
                .update(copy)
                .set({ is_claimed: false })
                .where(eq(copy.id, copyId))
                .returning();
            if (!updatedCopy)
                throw new AppError(
                    "Copy not found or already unclaimed.",
                    404,
                    { id: copyId },
                );

            const [deletedReservation] = await db
                .delete(reservation)
                .where(eq(historical.book_id, updatedCopy.book_id))
                .returning();
            if (!deletedReservation)
                throw new AppError("Error while deleting reservation.", 500);

            res.status(200).json({
                message: "Copy successfully unclaimed.",
                updatedCopy,
                deletedReservation,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while unclaiming the copy.", 500, error),
            );
        }
    },
);
