import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.delete("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCopy = await db
            .delete(copy)
            .where(sql`${copy.id} = ${id}`)
            .returning();

        if (deletedCopy.length === 0) {
            res.status(404).json({
                message: "Copy not found.",
                copy: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Copy successfully deleted.",
                deletedCopy,
            });
        }
    } catch (error) {
        console.error("Error while deleting the copy:", error);
        res.status(500).json({
            message: "Error while deleting the copy.",
            error,
        });
    }
});
