import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.put(
    "/books/:id/archiving",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid book id.", 400, { id: bookId });

            const [selectedBook] = await db
                .select()
                .from(books)
                .where(eq(books.id, bookId));

            if (!selectedBook)
                throw new AppError("Book not found.", 404, { id: bookId });
            if (selectedBook.is_removed)
                throw new AppError("Book is already archived.", 400, {
                    id: bookId,
                });

            const [updatedBook] = await db
                .update(books)
                .set({ is_removed: true })
                .where(eq(books.id, bookId))
                .returning();
            if (!updatedBook)
                throw new AppError("Failed to archive the book.", 500, {
                    id: bookId,
                });

            res.status(200).json("Book deleted successfully.");
        } catch (error) {
            next(error);
        }
    },
);

app.put(
    "/books/:id/unarchiving",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid book id.", 400, { id: bookId });

            const [selectedBook] = await db
                .select()
                .from(books)
                .where(eq(books.id, bookId));

            if (!selectedBook)
                throw new AppError("Book not found.", 404, { id: bookId });
            if (!selectedBook.is_removed)
                throw new AppError("Book is already active.", 400, {
                    id: bookId,
                });

            const [updatedBook] = await db
                .update(books)
                .set({ is_removed: false })
                .where(eq(books.id, bookId))
                .returning();

            if (!updatedBook)
                throw new AppError("Failed to unarchive the book.", 500, {
                    id: bookId,
                });

            res.status(200).json("Book recovered successfully.");
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while recovering the book.", 500, error),
            );
        }
    },
);

/**
 * @swagger
 */
