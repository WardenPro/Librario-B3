import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { review, insertReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.post("/reviews", checkTokenMiddleware, async (req, res) => {
    try {
        const validatedData = insertReviewSchema.parse(req.body);
        const newReview = await db.insert(review).values(validatedData).returning();
        res.status(201).json({
            message: "Avis ajouté avec succès.",
            newReview,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'avis :", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de l'avis.",
            error,
        });
    }
});