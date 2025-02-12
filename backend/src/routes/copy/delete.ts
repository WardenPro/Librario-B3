import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { books } from "../../db/schema/book";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.delete(
    "/copy/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
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
            }

            const bookId = deletedCopy[0].book_id;

            await db
                .update(books)
                .set({ quantity: sql`${books.quantity} - 1` })
                .where(sql`${books.id} = ${bookId}`);

            res.status(200).json({
                message:
                    "Copy successfully deleted, and book quantity updated.",
                deletedCopy,
            });
        } catch (error) {
            console.error("Error while deleting the copy:", error);
            res.status(500).json({
                message: "Error while deleting the copy.",
                error,
            });
        }
    },
);
