import { app } from "../..";
import { db } from "../../app/config/database";
import { eq, desc, sql } from "drizzle-orm";
import { review, selectReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/reviews",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allReviews = await db.select().from(review);
            const validatedReviews = allReviews.map((r) =>
                selectReviewSchema.parse(r),
            );
            if (validatedReviews.length === 0)
                throw new AppError("No reviews found.", 404);
            res.status(200).json(validatedReviews);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Internal error during reviews retrieval", 500),
            );
        }
    },
);

app.get(
    "/books/:id/reviews",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid bookId ID provided.", 400);

            const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : 30;
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const offset = (page - 1) * itemsPerPage;

            const paginatedReviews = await db
                .select()
                .from(review)
                .where(eq(review.book_id, bookId))
                .orderBy(desc(review.created_at))
                .limit(itemsPerPage)
                .offset(offset);

            const validatedReviews = paginatedReviews.map((r) =>
                selectReviewSchema.parse(r),
            );

            const [totalCount] = await db
                .select({ count: sql`COUNT(*)`.mapWith(Number) })
                .from(review)
                .where(eq(review.book_id, bookId));

            const totalPages = Math.ceil(totalCount.count / itemsPerPage);

            res.status(200).json({
                data: validatedReviews,
                pagination: {
                    total: totalCount.count,
                    page: page,
                    itemsPerPage: itemsPerPage,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Internal error during review retrieval", 500),
            );
        }
    },
);