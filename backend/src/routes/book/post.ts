import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books, insertBookSchema } from "../../db/schema/book";
import { copy } from "../../db/schema/copy";
import { eq } from "drizzle-orm";
import { or } from "drizzle-orm/expressions";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import ISBN from "node-isbn";
import { Request, Response } from "express";

interface IndustryIdentifier {
    type: string;
    identifier: string;
}

ISBN.provider(["google"]);

app.post(
    "/books/import",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response) => {
        try {
            console.log("📌 [INFO] Body Request :", req.body);

            const { isbn, quantity, state } = req.body;

            if (!isbn) {
                console.log("❌ [ERROR] ISBN missing in the request.");
                res.status(400).json({ message: "ISBN is required." });
                return;
            }

            console.log(`📌 [INFO] ISBN get: ${isbn}`);

            const isbnRegex = /^(?:\\d{9}[xX]|\\d{10}|\\d{13})$/;
            if (isbnRegex.test(isbn)) {
                console.log("❌ [ERROR] Invalid ISBN format.");
                res.status(400).json({ message: "Invalid ISBN format." });
                return;
            }

            const parsedQuantity = parseInt(quantity, 10);
            const numberOfCopies =
                !isNaN(parsedQuantity) && parsedQuantity > 0
                    ? parsedQuantity
                    : 1;

            const bookInfo = await ISBN.resolve(isbn);
            if (!bookInfo) {
                console.log("Book not found with Google Books.");
                res.status(404).json({ message: "Book not found." });
                return;
            }

            const industryIdentifiers =
                bookInfo.industryIdentifiers as unknown as IndustryIdentifier[];

            console.log(
                "📌 [INFO] Book information industryIdentifiers:",
                bookInfo.industryIdentifiers,
            );
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

            let existingIsbnBook;
            if (newBook.ISBN_10 != null) {
                existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.ISBN_10, newBook.ISBN_10));
            } else if (newBook.ISBN_13 != null) {
                existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.ISBN_13, newBook.ISBN_13));
            } else {
                console.log(
                    "❌ [ERROR] No ISBN found in the book information.",
                );
                res.status(404).json({
                    message: "No ISBN found in the book information.",
                });
                return;
            }

            if (existingIsbnBook.length > 0) {
                console.log(
                    "❌ [ERROR] A book with this ISBN already exists in the database.",
                );
                res.status(409).json({
                    message:
                        "A book with this ISBN already exists in the database.",
                });
                return;
            }

            console.log("📝 [INFO] Adding book in database ...");
            await db.insert(books).values(newBook);
            console.log("✅ [INFO] Book added successfully.");

            const conditions = [];

            if (newBook.ISBN_10) {
                conditions.push(eq(books.ISBN_10, newBook.ISBN_10));
            }

            if (newBook.ISBN_13) {
                conditions.push(eq(books.ISBN_13, newBook.ISBN_13));
            }

            const [inserted] = await db
                .select()
                .from(books)
                .where(or(...conditions));

            if (!inserted) {
                res.status(500).json({
                    message: "Error retrieving inserted book from database.",
                });
                return;
            }

            const bookId = inserted.id;

             // ✅ Vérifier si `copies` est bien un tableau
             const copiesArray = Array.isArray(req.body.copies) ? req.body.copies : [];

             // ✅ Générer les copies avec des états différents
             const copiesToInsert = [];
             for (let i = 0; i < numberOfCopies; i++) {
                 copiesToInsert.push({
                     state: copiesArray[i]?.state || "new", // Si `state` n'est pas défini, on met "new"
                     is_reserved: false,
                     is_claimed: false,
                     copy_number: i + 1,
                     book_id: bookId,
                 });
             }
 
             // ✅ Insertion des copies
             await db.insert(copy).values(copiesToInsert);
             console.log(`✅ [INFO] Created ${copiesToInsert.length} copies with varying states.`);
 

            res.status(201).json({
                message: "Book added successfully.",
                book: {
                    ...newBook,
                    id: bookId,
                },
                total_copies: copiesToInsert.length,
                copy_state: state,
            });
            return;
        } catch (error) {
            console.error("❌ [ERROR] Internal server error:", error);
            res.status(500).json({ message: "Internal server error." });
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
                copy_number: i + 1,
                book_id: bookId,
            });
        }

        await db.insert(copy).values(copiesToInsert);
        console.log(`✅ [INFO] Created ${copiesToInsert.length} copies with varying states.`);

        res.status(201).json({
            message: "Book successfully added with copies.",
            book: {
                ...newBook,
            },
            total_copies: copiesToInsert.length,
            copies: copiesToInsert,
        });

    } catch (error) {
        console.error("❌ [ERROR] Error while adding the book:", error);
        res.status(500).json({
            message: "Error while adding the book.",
            error,
        });
    }
});