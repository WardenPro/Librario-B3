import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { review } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.delete(
    "/reviews/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deletedReview = await db
                .delete(review)
                .where(sql`${review.id} = ${id}`)
                .returning();

            if (deletedReview.length === 0) {
                res.status(404).json({
                    message: "Review not found.",
                    review: `id: ${id}`,
                });
            } else {
                res.status(200).json({
                    message: "Review successfully deleted.",
                    deletedReview,
                });
            }
        } catch (error) {
            console.error("Error while deleting the review:", error);
            res.status(500).json({
                message: "Error while deleting the review.",
                error,
            });
        }
    },
);
