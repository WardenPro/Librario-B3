import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response } from "express";

app.put(
    "/books/unarchiving/:id",
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
                        .set({ is_removed: false })
                        .where(sql`${books.id} = ${id}`);
                    res.status(200).json("Book recovered successfully.");
                } catch (error) {
                    console.error("Error while recovering the book.", error);
                    res.status(500).json({
                        message: "Error while recovering the book.",
                        error,
                    });
                }
            }
        } catch (error) {
            console.error("Error while recovering the book.", error);
            res.status(500).json({
                message: "Error while recovering the book.",
                error,
            });
        }
    },
);

/**
 * @swagger
 */
