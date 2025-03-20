import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { books, selectBookSchema } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/books",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allBooks = await db.select().from(books);
            const validatedBooks = allBooks.map((books) => {
                return selectBookSchema.parse(books);
            });
            res.status(200).json(validatedBooks);
        } catch (error) {
            return next(
                new AppError("Error while retrieving the books.", 500, error),
            );
        }
    },
);

app.get(
    "/books/:id",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid book ID.", 400, { id: bookId });

            const [selectedBook] = await db
                .select()
                .from(books)
                .where(eq(books.id, bookId));
            if (!selectedBook)
                throw new AppError("Book not found.", 404, { id: bookId });

            const validatedBook = selectBookSchema.parse(selectedBook);
            res.status(200).json(validatedBook);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(new AppError("Error while retrieving the book.", 500));
        }
    },
);

/**
 * @swagger
 **/
