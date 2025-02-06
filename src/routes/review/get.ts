import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { review, selectReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.get("/reviews", checkTokenMiddleware, async (req, res) => {
    try {
        const allReviews = await db.select().from(review);
        const validatedReviews = allReviews.map((r) =>
            selectReviewSchema.parse(r),
        );
        res.status(200).json(validatedReviews);
    } catch (error) {
        console.error("Error while retrieving reviews:", error);
        res.status(500).json({
            message: "Error while retrieving reviews.",
            error,
        });
    }
});

app.get("/reviews/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const foundReview = await db
            .select()
            .from(review)
            .where(sql`${review.id} = ${id}`);

        if (foundReview.length === 0) {
            res.status(404).json({
                message: "Review not found.",
                review: `id: ${id}`,
            });
        } else {
            const validatedReview = foundReview.map((r) =>
                selectReviewSchema.parse(r),
            );
            res.status(200).json(validatedReview);
        }
    } catch (error) {
        console.error("Error while retrieving the review:", error);
        res.status(500).json({
            message: "Error while retrieving the review.",
            error,
        });
    }
});
