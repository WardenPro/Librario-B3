import { app } from "../../app/index";
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
    "/historical/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0)
                throw new AppError("Invalid bookId ID provided.", 400);

            const [foundHistorical] = await db
                .select()
                .from(historical)
                .where(eq(historical.id, id));
            if (!foundHistorical)
                throw new AppError("Historical record not found.", 404, {
                    id: id,
                });
            res.status(200).json(foundHistorical);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new Error(
                    "An error occurred while retrieving historical record.",
                ),
            );
        }
    },
);
