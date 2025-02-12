import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { review, insertReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.post(
    "/reviews",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response) => {
        try {
            const validatedData = insertReviewSchema.parse(req.body);
            const newReview = await db
                .insert(review)
                .values(validatedData)
                .returning();
            res.status(201).json({
                message: "Review successfully added.",
                newReview,
            });
        } catch (error) {
            console.error("Error while adding the review:", error);
            res.status(500).json({
                message: "Error while adding the review.",
                error,
            });
        }
    },
);
