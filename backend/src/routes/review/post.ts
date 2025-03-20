import { app } from "../..";
import { db } from "../../app/config/database";
import { review, insertReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.post(
    "/reviews",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for review.", 400);
            if (!req.payload) throw new AppError("Payload not found.", 400);

            const validatedData = insertReviewSchema.parse({
                description: req.body.description,
                note: req.body.note,
                book_id: req.body.book_id,
                condition: req.body.condition,
                copy_id: req.body.copy_id,
                user_id: req.payload.user_id,
            });
            const newReview = await db
                .insert(review)
                .values(validatedData)
                .returning();
            res.status(201).json({
                message: "Review successfully added.",
                newReview,
            });
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                if (error["code"] === "23505") {
                    return next(new AppError("Review already exists.", 409));
                } else if (error["code"] === "23503") {
                    return next(new AppError("Book or copy invalid.", 400));
                }
            } else if (error instanceof AppError) {
                return next(error);
            }
            return next(
                new AppError("Error while adding the review.", 500, error),
            );
        }
    },
);
