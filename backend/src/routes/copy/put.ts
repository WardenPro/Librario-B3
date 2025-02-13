import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy, updateCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.put(
    "/copy/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const validatedData = updateCopySchema.parse(req.body);
            const updatedCopy = await db
                .update(copy)
                .set(validatedData)
                .where(sql`${copy.id} = ${id}`)
                .returning()
                .execute();

            if (updatedCopy.length === 0) {
                res.status(404).json({
                    message: "Copy not found or no modifications applied.",
                    copy: `id: ${id}`,
                });
                return;
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
    },
);

//change id to barcode number

app.put(
    "/copy/claimed/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
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
    },
);

app.put(
    "/copy/unclaimed/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updatedCopy = await db
                .update(copy)
                .set({ is_claimed: false })
                .where(sql`${copy.id} = ${id}`)
                .returning();

            if (updatedCopy.length === 0) {
                res.status(404).json({
                    message: "Copy not found or already unclaimed.",
                    copy: `id: ${id}`,
                });
            } else {
                res.status(200).json({
                    message: "Copy successfully unclaimed.",
                    updatedCopy,
                });
            }
        } catch (error) {
            console.error("Error while unreserving the copy:", error);
            res.status(500).json({
                message: "Error while unreserving the copy.",
                error,
            });
        }
    },
);
