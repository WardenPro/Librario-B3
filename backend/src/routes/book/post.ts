import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books, insertBookSchema } from "../../db/schema/book";
import { copy } from "../../db/schema/copy";
import { eq } from "drizzle-orm";
import { or } from "drizzle-orm/expressions";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import ISBN from "node-isbn";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { generateBarcodeImage } from "../../app/services/barcode"; 

interface IndustryIdentifier {
    type: string;
    identifier: string;
}

ISBN.provider(["google"]);

app.post(
    "/books/import",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { isbn, quantity, state } = req.body;

            if (!isbn) throw new AppError("ISBN is required.", 400);

            const isbnRegex = /^(?:\d{9}[xX]|\\d{10}|\\d{13})$/;
            if (!isbnRegex.test(isbn))
                throw new AppError("Invalid ISBN format.", 400);

            const parsedQuantity = parseInt(quantity, 10);
            const numberOfCopies =
                !isNaN(parsedQuantity) && parsedQuantity > 0
                    ? parsedQuantity
                    : 1;

            const bookInfo = await ISBN.resolve(isbn);
            if (!bookInfo)
                throw new AppError("Book not found with Google Books.", 404);

            const industryIdentifiers =
                bookInfo.industryIdentifiers as unknown as IndustryIdentifier[];

            const newBook = {
                title: bookInfo.title || "Unknown",
                description: bookInfo.description || "No description available",
                printType: bookInfo.printType || "Unknown",
                category: bookInfo.categories
                    ? bookInfo.categories.join(", ")
                    : "Unknown",
                publisher: bookInfo.publisher || "Unknown",
                author: bookInfo.authors
                    ? bookInfo.authors.join(", ")
                    : "Unknown",
                quantity: numberOfCopies,
                publish_date: bookInfo.publishedDate
                    ? new Date(bookInfo.publishedDate)
                    : new Date(),
                ISBN_10:
                    industryIdentifiers.find((i) => i.type === "ISBN_10")
                        ?.identifier || null,
                ISBN_13:
                    industryIdentifiers.find((i) => i.type === "ISBN_13")
                        ?.identifier || null,
                image_link: bookInfo.imageLinks?.thumbnail || null,
                is_removed: false,
            };

            const conditions = [];
            if (newBook.ISBN_10)
                conditions.push(eq(books.ISBN_10, newBook.ISBN_10));
            if (newBook.ISBN_13)
                conditions.push(eq(books.ISBN_13, newBook.ISBN_13));

            let existingIsbnBook;
            if (conditions.length > 0) {
                existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(or(...conditions));
            } else {
                throw new AppError(
                    "No ISBN found in the book information.",
                    404,
                );
            }

            if (existingIsbnBook.length > 0)
                throw new AppError(
                    "A book with this ISBN already exists in the database.",
                    409,
                );

            const [insertedBook] = await db
                .insert(books)
                .values(newBook)
                .returning();

            if (!insertedBook)
                throw new AppError(
                    "Error retrieving inserted book from database.",
                    500,
                );

            const copyState =
                state && typeof state === "string" && state.trim() !== ""
                    ? state
                    : "new";

            const copiesToInsert = [];
            for (let i = 0; i < numberOfCopies; i++) {
                copiesToInsert.push({
                    state: copiesArray[i]?.state || "new",
                    is_reserved: false,
                    is_claimed: false,
                    barcode: "null",
                    book_id: insertedBook.id,
                });
            }

            const insertedCopies = await db.insert(copy).values(copiesToInsert).returning();

            for (const copyRecord of insertedCopies) {
                generateBarcodeImage(copyRecord.id);
            }
            console.log(`✅ [INFO] Created ${copiesToInsert.length} copies with varying states.`);

            res.status(201).json({
                message: "Book added successfully.",
                book: {
                    ...newBook,
                    id: insertedBook.id,
                },
                total_copies: copiesToInsert.length,
            });
        } catch (error) {
            next(error);
        }
    },
);


app.post("/books/manual", checkTokenMiddleware, async (req, res) => {
    try {
        console.log("📌 [INFO] Body Request :", req.body);

        const validatedData = insertBookSchema.parse(req.body);
        console.log("✅ [INFO] Data validated successfully.");

        console.log("📝 [INFO] Adding book in database ...");
        const [newBook] = await db.insert(books).values(validatedData).returning();

        if (!newBook) {
            console.error("❌ [ERROR] Failed to insert book.");
            res.status(500).json({ message: "Failed to insert book." });
        }

        console.log("✅ [INFO] Book added successfully:", newBook);

        const bookId = newBook.id;
        const numberOfCopies = validatedData.quantity || 1;

        const copiesArray = Array.isArray(req.body.copies) ? req.body.copies : [];

        const copiesToInsert = [];
        for (let i = 0; i < numberOfCopies; i++) {
            copiesToInsert.push({
                state: copiesArray[i]?.state || "new",
                is_reserved: false,
                is_claimed: false,
                barcode: "null",
                book_id: bookId,
            });
        }
        
        const insertedCopies = await db.insert(copy).values(copiesToInsert).returning();
        if (!insertedCopies)
            throw new AppError("Error inserting copies into the database.", 500);

        for (const copyRecord of insertedCopies) {
            generateBarcodeImage(copyRecord.id);
        }
        console.log(`✅ [INFO] Created ${copiesToInsert.length} copies with varying states.`);

        res.status(201).json({
            message: "Book successfully added with copies.",
            book: {
                ...newBook,
            },
            total_copies: copiesToInsert.length,
        });

    } catch (error) {
        console.error("❌ [ERROR] Error while adding the book:", error);
        res.status(500).json({
            message: "Error while adding the book.",
            error,
        });
    }
});
