import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { historical, selectHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/historical",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allHistorical = await db.select().from(historical);
            if (!allHistorical)
                throw new AppError("No historical records found.", 404);
            const validatedHistorical = allHistorical.map((h) =>
                selectHistoricalSchema.parse(h),
            );
            res.status(200).json(validatedHistorical);
        } catch (error) {
            if (error instanceof Error) return next(error);
            next(
                new Error(
                    "An error occurred while retrieving historical records.",
                ),
            );
        }
    },
);

app.get(
    "/users/:id/historical",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin_or_owner", historical),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID provided.", 400);

            const userHistorical = await db
                .select()
                .from(historical)
                .where(eq(historical.user_id, userId));

            const validatedHistorical = userHistorical.map((h) =>
                selectHistoricalSchema.parse(h)
            );
            
            res.status(200).json(validatedHistorical);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new Error(
                    "An error occurred while retrieving historical records.",
                ),
            );
        }
    },
);
