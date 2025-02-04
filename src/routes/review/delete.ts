import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { review } from "../../db/schema/review";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/reviews/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await db.delete(review).where(sql`${review.id} = ${id}`).returning();

        if (deletedReview.length === 0) {
            res.status(404).json({
                message: "Avis non trouvé.",
                review: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Avis supprimé avec succès.",
                deletedReview,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis :", error);
        res.status(500).json({
            message: "Erreur lors de la suppression de l'avis.",
            error,
        });
    }
});