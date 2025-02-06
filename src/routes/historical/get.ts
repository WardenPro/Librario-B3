import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical, selectHistoricalSchema } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.get("/historical", checkTokenMiddleware, async (req, res) => {
    try {
        const allHistorical = await db.select().from(historical);
        const validatedHistorical = allHistorical.map((h) =>
            selectHistoricalSchema.parse(h),
        );
        res.status(200).json(validatedHistorical);
    } catch (error) {
        console.error("Error while retrieving historical records:", error);
        res.status(500).json({
            message: "Error while retrieving historical records.",
            error,
        });
    }
});

app.get("/historical/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const foundHistorical = await db
            .select()
            .from(historical)
            .where(sql`${historical.id} = ${id}`);

        if (foundHistorical.length === 0) {
            res.status(404).json({
                message: "Historical record not found.",
                historical: `id: ${id}`,
            });
        } else {
            const validatedHistorical = foundHistorical.map((h) =>
                selectHistoricalSchema.parse(h),
            );
            res.status(200).json(validatedHistorical);
        }
    } catch (error) {
        console.error("Error while retrieving the historical record:", error);
        res.status(500).json({
            message: "Error while retrieving the historical record.",
            error,
        });
    }
});
