import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { historical, selectHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";
import { users } from "../../db/schema/users";
import { books } from "../../db/schema/book";

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
                .select({
                    id: historical.id,
                    date_read: historical.date_read,
                    book_title: books.title,
                    user_first_name: users.first_name,
                    user_last_name: users.last_name,
                })
                .from(historical)
                .innerJoin(books, eq(historical.book_id, books.id))
                .innerJoin(users, eq(historical.user_id, users.id))
                .where(eq(historical.user_id, userId))
                .orderBy(historical.date_read);

            res.status(200).json(userHistorical);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new Error("An error occurred while retrieving historical records.")
            );
        }
    }
);

