import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { books, SelectBookSchema } from "../../db/schema/book";
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
                return SelectBookSchema.parse(books);
            });
            res.status(200).json(validatedBooks);
        } catch (error) {
            next(error);
        }
    },
);

app.get(
    "/books/:id",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const Book = await db
                .select()
                .from(books)
                .where(sql`${books.id} = ${id}`);
            if (Book.length === 0) {
                throw new AppError(`Book not found. ID: ${id}`, 404);
            }
            const validatedBooks = Book.map((books) => {
                return SelectBookSchema.parse(books);
            });
            res.status(200).json(validatedBooks);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * @swagger
 **/
