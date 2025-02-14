import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
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
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid book ID.", 400, { id: bookId });

            const [selectedBook] = await db
                .select()
                .from(books)
                .where(eq(books.id, bookId));
            if (!selectedBook) throw new AppError("Book not found.", 404);

            const deletedBook = await db
                .delete(books)
                .where(eq(books.id, bookId))
                .returning();
            if (deletedBook.length === 0)
                throw new AppError("Error while deleting the book.", 500);

            res.status(200).json({
                message: "Book deleted successfully.",
                id: bookId,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while deleting the book", 500, error),
            );
        }
    },
);

/**
 * @swagger
 */
