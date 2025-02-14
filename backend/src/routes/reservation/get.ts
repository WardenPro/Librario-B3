import { app } from "../../app/index";
import { db } from "../../app/config/database";
import {
    reservation,
    selectReservationSchema,
} from "../../db/schema/reservation";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { copy } from "../../db/schema/copy";
import { books } from "../../db/schema/book";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";

app.get(
    "/reservations",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allReservations = await db
                .select({
                    id: reservation.id,
                    reservation_date: reservation.reservation_date,
                    final_date: reservation.final_date,
                    user_id: reservation.user_id,
                    copy_id: reservation.copy_id,
                    is_claimed: copy.is_claimed,
                    book_title: books.title,
                    user_first_name: users.first_name,
                    user_last_name: users.last_name,
                })
                .from(reservation)
                .innerJoin(copy, eq(copy.id, reservation.copy_id))
                .innerJoin(books, eq(books.id, copy.book_id))
                .innerJoin(users, eq(users.id, reservation.user_id))
                .execute();

            console.log(allReservations);

            const validatedReservations = allReservations.map((r) => {
                const validatedReservation = selectReservationSchema.parse(r);
                return {
                    id: validatedReservation.id,
                    user_id: validatedReservation.user_id,
                    copy_id: validatedReservation.copy_id,
                    reservation_date: validatedReservation.reservation_date,
                    final_date: validatedReservation.final_date,
                    is_claimed: r.is_claimed,
                    user_first_name: r.user_first_name,
                    user_last_name: r.user_last_name,
                    book_title: r.book_title,
                };
            });

            res.status(200).json(validatedReservations);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError(
                    "Error while retrieving reservations.",
                    500,
                    error,
                ),
            );
        }
    },
);

app.get(
    "/reservations/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin_or_owner", reservation),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID", 400);
            const foundReservation = await db
                .select()
                .from(reservation)
                .where(eq(reservation.user_id, userId));
            const validatedReservations = foundReservation.map((r) =>
                selectReservationSchema.parse(r),
            );
            if (validatedReservations.length === 0)
                throw new AppError("Reservation not found", 404);
            res.status(200).json(validatedReservations);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError("Error while retrieving reservation.", 500, error),
            );
        }
    },
);
