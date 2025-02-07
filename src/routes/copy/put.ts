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
                message: "Copy not found or no modifications applied.",
                copy: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Copy successfully updated.",
                updatedCopy,
            });
        }
    } catch (error) {
        console.error("Error while updating the copy:", error);
        res.status(500).json({
            message: "Error while updating the copy.",
            error,
        });
    }
});

app.put("/copy/claimed/:id", checkTokenMiddleware,  async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCopy = await db
            .update(copy)
            .set({ is_claimed: true })
            .where(sql`${copy.id} = ${id}`)
            .returning();

        if (updatedCopy.length === 0) {
            res.status(404).json({
                message: "Copy not found or already claimed.",
                copy: `id: ${id}`,
            });
        } else {
            res.status(200).json({
                message: "Copy successfully claimed.",
                updatedCopy,
            });
        }
    } catch (error) {
        console.error("Error while reserving the copy:", error);
        res.status(500).json({
            message: "Error while reserving the copy.",
            error,
        });
    }
});