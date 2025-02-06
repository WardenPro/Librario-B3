import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { historical } from "../../db/schema/historical";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/historical/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedHistorical = await db
            .delete(historical)
            .where(sql`${historical.id} = ${id}`)
            .returning();

        if (deletedHistorical.length === 0) {
            res.status(404).json({
                message: "History not found.",
                historical: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "History successfully deleted.",
                deletedHistorical,
            });
        }
    } catch (error) {
        console.error("Error while deleting the history:", error);
        res.status(500).json({
            message: "Error while deleting the history.",
            error,
        });
    }
});
