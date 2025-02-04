import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { review, updateReviewSchema } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.put("/reviews/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateReviewSchema.parse(req.body);
        const updatedReview = await db.update(review).set(validatedData).where(sql`${review.id} = ${id}`).returning();

        if (updatedReview.length === 0) {
            res.status(404).json({
                message: "Avis non trouvé ou aucune modification appliquée.",
                review: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Avis mis à jour avec succès.",
                updatedReview,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avis :", error);
        res.status(500).json({
            message: "Erreur lors de la mise à jour de l'avis.",
            error,
        });
    }
});