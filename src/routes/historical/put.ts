import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical, selectHistoricalSchema, insertHistoricalSchema, updateHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.put("/historical/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateHistoricalSchema.parse(req.body);
        const updatedHistorical = await db.update(historical).set(validatedData).where(sql`${historical.id} = ${id}`).returning();

        if (updatedHistorical.length === 0) {
            res.status(404).json({
                message: "Historique non trouvé ou aucune modification appliquée.",
                historical: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Historique mis à jour avec succès.",
                updatedHistorical,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'historique :", error);
        res.status(500).json({
            message: "Erreur lors de la mise à jour de l'historique.",
            error,
        });
    }
});