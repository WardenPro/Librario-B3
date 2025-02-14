import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
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
    "/reviews/:id",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid bookId ID provided.", 400);

            const foundReview = await db
                .select()
                .from(review)
                .where(eq(review.book_id, bookId));
            const validatedReview = foundReview.map((r) =>
                selectReviewSchema.parse(r),
            );
            if (validatedReview.length === 0)
                throw new AppError("Review not found.", 404);

            res.status(200).json(validatedReview);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Internal error during review retrieval", 500),
            );
        }
    },
);
