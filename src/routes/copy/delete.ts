import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCopy = await db.delete(copy).where(sql`${copy.id} = ${id}`).returning();

        if (deletedCopy.length === 0) {
            res.status(404).json({
                message: "Copie non trouvée.",
                copy: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Copie supprimée avec succès.",
                deletedCopy,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de la copie :", error);
        res.status(500).json({
            message: "Erreur lors de la suppression de la copie.",
            error,
        });
    }
});