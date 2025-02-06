import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy, updateCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.put("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateCopySchema.parse(req.body);
        const updatedCopy = await db
            .update(copy)
            .set(validatedData)
            .where(sql`${copy.id} = ${id}`)
            .returning();

        if (updatedCopy.length === 0) {
            res.status(404).json({
                message: "Copie non trouvée ou aucune modification appliquée.",
                copy: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Copie mise à jour avec succès.",
                updatedCopy,
            });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la copie :", error);
        res.status(500).json({
            message: "Erreur lors de la mise à jour de la copie.",
            error,
        });
    }
});
