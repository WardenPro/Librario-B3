import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { review, updateReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.put(
    "/reviews/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for update.", 400);
            const reviewId = parseInt(req.params.id, 10);
            if (isNaN(reviewId) || reviewId <= 0)
                throw new AppError("Invalid review ID provided.", 400);

            const existingReview = await db
                .select()
                .from(review)
                .where(eq(review.id, reviewId))
                .execute();

            if (existingReview.length === 0)
                throw new AppError("Review not found.", 404, { id: reviewId });

            const validatedData = updateReviewSchema.parse(req.body);
            const updatedReview = await db
                .update(review)
                .set(validatedData)
                .where(eq(review.id, reviewId))
                .returning()
                .execute();

            if (updatedReview.length === 0) {
                throw new AppError("No changes applied.", 404, {
                    id: reviewId,
                });
            } else {
                res.status(200).json({
                    message: "Review successfully updated.",
                    updatedReview,
                });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(
                new AppError(
                    "Internal error while updating the review.",
                    500,
                    error,
                ),
            );
        }
    },
);
