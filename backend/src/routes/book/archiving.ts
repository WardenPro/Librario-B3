import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.put(
    "/books/archiving/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const Book = await db
                .select()
                .from(books)
                .where(sql`${books.id} = ${id}`);
            if (Book.length === 0) {
                res.status(404).json({
                    message: "Book not found.",
                    books: `id: ${id}`,
                });
            } else {
                try {
                    await db
                        .update(books)
                        .set({ is_removed: true })
                        .where(sql`${books.id} = ${id}`);
                    res.status(200).json("Book deleted successfully.");
                } catch (error) {
                    console.error("Error while deleting the book.", error);
                    res.status(500).json({
                        message: "Error while deleting the book.",
                        error,
                    });
                }
            }
        } catch (error) {
            console.error("Error while deleting the book.", error);
            res.status(500).json({
                message: "Error while deleting the book.",
                error,
            });
        }
    },
);

/**
 * @swagger
 */
