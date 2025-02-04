import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy, selectCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.get("/copy", checkTokenMiddleware, async (req, res) => {
    try {
        const allCopies = await db.select().from(copy);
        const validatedCopies = allCopies.map((c) => selectCopySchema.parse(c));
        res.status(200).json(validatedCopies);
    } catch (error) {
        console.error("Erreur lors de la récupération des copies :", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des copies.",
            error,
        });
    }
});

app.get("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const foundCopy = await db
            .select()
            .from(copy)
            .where(sql`${copy.id} = ${id}`);

        if (foundCopy.length === 0) {
            res.status(404).json({
                message: "Copie non trouvée.",
                copy: `id: ${id}`,
            });
        } else {
            const validatedCopies = foundCopy.map((c) => selectCopySchema.parse(c));
            res.status(200).json(validatedCopies);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de la copie :", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de la copie.",
            error,
        });
    }
});