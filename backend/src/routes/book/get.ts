import { app } from "../..";
import { db } from "../../app/config/database";
import { eq, sql, desc } from "drizzle-orm";
import { books, selectBookSchema } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/books",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : 30;
            const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
            const offset = (page - 1) * itemsPerPage;

            const paginatedBooks = await db
                .select()
                .from(books)
                .where(eq(books.is_removed, false))
                .orderBy(desc(books.publish_date))
                .limit(itemsPerPage)
                .offset(offset);

            const validatedBooks = paginatedBooks.map((book) => {
                return selectBookSchema.parse(book);
            });

            const [totalCount] = await db
                .select({ count: sql`COUNT(*)`.mapWith(Number) })
                .from(books)
                .where(eq(books.is_removed, false));

            const totalPages = Math.ceil(totalCount.count / itemsPerPage);

            res.status(200).json({
                data: validatedBooks,
                pagination: {
                    total: totalCount.count,
                    page: page,
                    itemsPerPage: itemsPerPage,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            });
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
