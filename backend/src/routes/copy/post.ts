import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { copy, insertCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

app.post("/copy", checkTokenMiddleware, checkRoleMiddleware, async (req, res) => {
    try {
        const validatedData = insertCopySchema.parse(req.body);
        const newCopy = await db.insert(copy).values(validatedData).returning();
        res.status(201).json({
            message: "Copy add successfully.",
            newCopy,
        });
    } catch (error) {
        console.error("Error while adding copy :", error);
        res.status(500).json({
            message: "Error while adding copy.",
            error,
        });
    }
});

