import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { historical, insertHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.post("/historical", checkTokenMiddleware, async (req, res) => {
    try {
        const validatedData = insertHistoricalSchema.parse(req.body);
        const newHistorical = await db
            .insert(historical)
            .values(validatedData)
            .returning();
        res.status(201).json({
            message: "Historical record successfully added.",
            newHistorical,
        });
    } catch (error) {
        console.error("Error while adding the historical record:", error);
        res.status(500).json({
            message: "Error while adding the historical record.",
            error,
        });
    }
});
