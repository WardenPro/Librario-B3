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
        console.error("Error while retrieving copies:", error);
        res.status(500).json({
            message: "Error while retrieving copies.",
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
                message: "Copy not found.",
                copy: `id: ${id}`,
            });
        } else {
            const validatedCopies = foundCopy.map((c) =>
                selectCopySchema.parse(c),
            );
            res.status(200).json(validatedCopies);
        }
    } catch (error) {
        console.error("Error while retrieving the copy:", error);
        res.status(500).json({
            message: "Error while retrieving the copy.",
            error,
        });
    }
});
