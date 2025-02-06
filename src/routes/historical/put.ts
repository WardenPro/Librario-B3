import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical, updateHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.put("/historical/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateHistoricalSchema.parse(req.body);
        const updatedHistorical = await db
            .update(historical)
            .set(validatedData)
            .where(sql`${historical.id} = ${id}`)
            .returning();

        if (updatedHistorical.length === 0) {
            res.status(404).json({
                message:
                    "Historical record not found or no modifications applied.",
                historical: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Historical record successfully updated.",
                updatedHistorical,
            });
        }
    } catch (error) {
        console.error("Error while updating the historical record:", error);
        res.status(500).json({
            message: "Error while updating the historical record.",
            error,
        });
    }
});
