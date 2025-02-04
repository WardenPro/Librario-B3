import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical, insertHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.post("/historical", checkTokenMiddleware, async (req, res) => {
    try {
        const validatedData = insertHistoricalSchema.parse(req.body);
        const newHistorical = await db.insert(historical).values(validatedData).returning();
        res.status(201).json({
            message: "Historique ajouté avec succès.",
            newHistorical,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'historique :", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de l'historique.",
            error,
        });
    }
});