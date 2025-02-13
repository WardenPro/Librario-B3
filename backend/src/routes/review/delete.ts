import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { review } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

app.delete(
    "/reviews/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = parseInt(req.params.id, 10);
            if (isNaN(reviewId) || reviewId <= 0)
                throw new AppError("Invalid review ID provided.", 400);
            const deletedReview = await db
                .delete(review)
                .where(eq(review.id, reviewId))
                .returning();

            if (deletedReview.length === 0) {
                throw new AppError("Review not found.", 404, {
                    id: `${reviewId}`,
                });
            } else {
                res.status(200).json({
                    message: "Review successfully deleted.",
                    deletedReview,
                });
            }
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError(
                    "Internal error while deleting review.",
                    500,
                    error,
                ),
            );
        }
    },
);
