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

app.get(
    "/reservations",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allReservations = await db.select().from(reservation);
            const validatedReservations = allReservations.map((r) =>
                selectReservationSchema.parse(r),
            );

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
