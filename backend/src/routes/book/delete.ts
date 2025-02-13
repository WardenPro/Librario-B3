import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.delete(
    "/books/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const Book = await db
                .select()
                .from(books)
                .where(sql`${books.id} = ${id}`);
            if (Book.length === 0) {
                throw new AppError("Book not found.", 404);
            }
            try {
                await db.delete(books).where(sql`${books.id} = ${id}`);
                res.status(200).json("Book deleted successfully.");
            } catch (error) {
                throw new AppError(
                    "Error while deleting the book.",
                    500,
                    error,
                );
            }
        } catch (error) {
            next(error);
        }
    },
);

/**
 * @swagger
 */
