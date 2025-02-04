import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical, selectHistoricalSchema, insertHistoricalSchema, updateHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/historical/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedHistorical = await db.delete(historical).where(sql`${historical.id} = ${id}`).returning();

        if (deletedHistorical.length === 0) {
            res.status(404).json({
                message: "Historique non trouvé.",
                historical: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Historique supprimé avec succès.",
                deletedHistorical,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de l'historique :", error);
        res.status(500).json({
            message: "Erreur lors de la suppression de l'historique.",
            error,
        });
    }
});