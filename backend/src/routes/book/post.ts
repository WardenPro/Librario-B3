import { app } from "../..";
import { db } from "../../app/config/database";
import { books, insertBookSchema } from "../../db/schema/book";
import { copy } from "../../db/schema/copy";
import { eq, or } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { generateBarcodeImage } from "../../app/services/barcode";

interface BookInfo {
    title?: string;
    description?: string;
    printType?: string;
    categories?: string[];
    publisher?: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    language?: string;
    industryIdentifiers?: Array<{
        type: string;
        identifier: string;
    }>;
    imageLinks?: {
        thumbnail?: string;
    };
}

async function fetchBookFromGoogleBooks(isbn: string): Promise<BookInfo> {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
        );

        if (!response.data.items || response.data.items.length === 0) {
            throw new AppError("Book not found on Google Books.", 404);
        }

        const bookData = response.data.items[0].volumeInfo;
        return {
            title: bookData.title,
            description: bookData.description,
            printType: bookData.printType,
            categories: bookData.categories,
            publisher: bookData.publisher,
            authors: bookData.authors,
            pageCount: bookData.pageCount,
            language: bookData.language,
            publishedDate: bookData.publishedDate,
            industryIdentifiers: bookData.industryIdentifiers,
            imageLinks: bookData.imageLinks,
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new AppError("Book not found on Google Books.", 404);
        }
        throw new AppError("Error retrieving book information.", 500);
    }
}

async function buildBook(bookInfo: BookInfo, numberOfCopies: number) {
    const industryIdentifiers = bookInfo.industryIdentifiers || [];

    let bookIMG = bookInfo.imageLinks?.thumbnail || null;
    if (bookIMG !== null) {
        try {
            let image = await axios.get(bookIMG, {
                responseType: "arraybuffer",
            });
            bookIMG = Buffer.from(image.data).toString("base64");
        } catch (error) {
            console.error("Error fetching image:", error);
            bookIMG = null;
        }
    }

    const newBook = {
        title: bookInfo.title || "Unknown",
        description: bookInfo.description || "No description available",
        printType: bookInfo.printType || "Unknown",
        category: bookInfo.categories
            ? bookInfo.categories.join(", ")
            : "Unknown",
        publisher: bookInfo.publisher || "Unknown",
        author: bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown",
        pageCount: bookInfo.pageCount,
        language: bookInfo.language || "Unknown",
        quantity: numberOfCopies,
        publish_date: bookInfo.publishedDate
            ? new Date(bookInfo.publishedDate)
            : new Date(),
        ISBN_10:
            industryIdentifiers.find((i) => i.type === "ISBN_10")?.identifier ||
            null,
        ISBN_13:
            industryIdentifiers.find((i) => i.type === "ISBN_13")?.identifier ||
            null,
        image_link: bookIMG,
        is_removed: false,
    };

    return newBook;
}

app.post(
    "/books/import",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { isbn, quantity, state } = req.body;
            if (!isbn) throw new AppError("ISBN is required.", 400);

            const isbnRegex = /^(?:\d{9}[xX]|\d{10}|\d{13})$/;
            if (!isbn || !isbnRegex.test(isbn))
                throw new AppError("Invalid ISBN format.", 400);

            const numberOfCopies =
                typeof quantity === "number" && quantity > 0
                    ? Math.floor(quantity)
                    : 1;

            const bookInfo = await fetchBookFromGoogleBooks(isbn);

            if (!bookInfo)
                throw new AppError("Book not found with Google Books.", 404);

            const newBook = await buildBook(bookInfo, numberOfCopies);

            const conditions = [];
            if (newBook.ISBN_10)
                conditions.push(eq(books.ISBN_10, newBook.ISBN_10));
            if (newBook.ISBN_13)
                conditions.push(eq(books.ISBN_13, newBook.ISBN_13));

            if (conditions.length > 0) {
                const existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(or(...conditions));
                if (existingIsbnBook.length > 0)
                    throw new AppError(
                        "A book with this ISBN already exists in the database.",
                        409,
                    );
            }

            const insertedBook = await db.transaction(async (trx) => {
                const [newInsertedBook] = await trx
                    .insert(books)
                    .values(newBook)
                    .returning();
                if (!newInsertedBook)
                    throw new AppError(
                        "Error inserting book into the database.",
                        500,
                    );

                const copiesToInsert = Array.from({
                    length: numberOfCopies,
                }).map(() => ({
                    state: state?.trim() || "new",
                    is_reserved: false,
                    is_claimed: false,
                    book_id: newInsertedBook.id,
                }));
                const insertedCopies = await trx
                    .insert(copy)
                    .values(copiesToInsert)
                    .returning();
                if (insertedCopies.length === 0)
                    throw new AppError("Error inserting copies.", 500);

                for (const copyRecord of insertedCopies) {
                    try {
                        await generateBarcodeImage(copyRecord.id);
                    } catch (error) {
                        console.error(
                            "Error generating barcode for copy:",
                            copyRecord.id,
                            error,
                        );
                    }
                }

                return newInsertedBook;
            });

            res.status(201).json({
                message: "Book added successfully.",
                book: insertedBook,
                total_copies: numberOfCopies,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while importing the book.", 500, error),
            );
        }
    },
);

app.post(
    "/books/manual",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = insertBookSchema.parse(req.body);

            const newBook = await db.transaction(async (trx) => {
                const [insertedBook] = await trx
                    .insert(books)
                    .values(validatedData)
                    .returning();
                if (!insertedBook)
                    throw new AppError("Failed to insert book.", 500);

                const numberOfCopies = validatedData.quantity || 1;
                const copiesArray = Array.isArray(req.body.copies)
                    ? req.body.copies
                    : [];

                const copiesToInsert = Array.from(
                    { length: numberOfCopies },
                    (_, i) => ({
                        state: copiesArray[i]?.trim() || "new",
                        is_reserved: false,
                        is_claimed: false,
                        book_id: insertedBook.id,
                    }),
                );

                const insertedCopies = await trx
                    .insert(copy)
                    .values(copiesToInsert)
                    .returning();
                if (insertedCopies.length === 0)
                    throw new AppError(
                        "Error inserting copies into the database.",
                        500,
                    );

                for (const copyRecord of insertedCopies) {
                    try {
                        await generateBarcodeImage(copyRecord.id);
                    } catch (error) {
                        console.error(
                            "Error generating barcode for copy:",
                            copyRecord.id,
                            error,
                        );
                    }
                }

                return insertedBook;
            });

            res.status(201).json({
                message: "Book successfully added with copies.",
                book: newBook,
                total_copies: validatedData.quantity || 1,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while adding the book.", 500, error),
            );
        }
    },
);
