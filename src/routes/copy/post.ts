import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy, selectCopySchema, insertCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.post("/copy", checkTokenMiddleware, async (req, res) => {
    try {
        const validatedData = insertCopySchema.parse(req.body);
        const newCopy = await db.insert(copy).values(validatedData).returning();
        res.status(201).json({
            message: "Copie ajoutée avec succès.",
            newCopy,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la copie :", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la copie.",
            error,
        });
    }
});
