import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
import { copy } from "../../db/schema/copy";
import { and, eq } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import ISBN from "node-isbn";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

ISBN.provider(["google"]);

app.post(
    "/books/import",
    checkTokenMiddleware,
    checkRoleMiddleware,
    async (req, res) => {
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
            const numberOfCopies = !isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;

            const bookInfo = await ISBN.resolve(isbn);
            if (!bookInfo) {
                console.log("❌ [ERROR] Book not found with Google Books.");
                res.status(404).json({ message: "Book not found." });
                return;
            }

            const newBook = {
                name: bookInfo.title || "Unknown",
                description: bookInfo.description || "No description available",
                type: "book",
                category: "Unknown",
                publisher: bookInfo.publisher || "Unknown",
                author: bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown",
                quantity: numberOfCopies,
                publish_date: bookInfo.publishedDate
                    ? new Date(bookInfo.publishedDate)
                    : new Date(),
                isbn: parseInt(isbn, 10),
                image_link: bookInfo.imageLinks?.thumbnail || null,
                is_removed: false,
            };

            const existingIsbnBook = await db
                .select()
                .from(books)
                .where(eq(books.isbn, newBook.isbn));

            if (existingIsbnBook.length > 0) {
                console.log("❌ [ERROR] A book with this ISBN already exists in the database.");
                res.status(409).json({
                    message: "A book with this ISBN already exists in the database.",
                });
                return;
            }

            const existingSimilarBook = await db
                .select()
                .from(books)
                .where(
                    and(
                        eq(books.name, newBook.name),
                        eq(books.author, newBook.author),
                        eq(books.publisher, newBook.publisher),
                    )
                );

            if (existingSimilarBook.length > 0) {
                console.log("❌ [ERROR] A book with the same title, author, and publisher already exists in the database.");
                res.status(409).json({
                    message: "A book with the same title, author, and publisher already exists in the database.",
                });
                return;
            }

            console.log("📝 [INFO] Adding book in database ...");
            await db.insert(books).values(newBook);
            console.log("✅ [INFO] Book added successfully.");

            const [inserted] = await db
                .select()
                .from(books)
                .where(eq(books.isbn, newBook.isbn));

            if (!inserted) {
                res.status(500).json({
                    message: "Error retrieving inserted book from database.",
                });
                return;
            }

            const bookId = inserted.id;

            const copyState = state && typeof state === "string" && state.trim() !== ""
                ? state
                : "new";

            const copiesToInsert = [];
            for (let i = 1; i <= numberOfCopies; i++) {
                copiesToInsert.push({
                    state: copyState,
                    is_reserved: false,
                    copy_number: i,
                    book_id: bookId,
                });
            }

            await db.insert(copy).values(copiesToInsert);

            console.log(`✅ [INFO] Created ${copiesToInsert.length} copies with state '${copyState}'.`);

            res.status(201).json({
                message: "Book added successfully.",
                book: {
                    ...newBook,
                    id: bookId,
                },
                total_copies: copiesToInsert.length,
                copy_state: copyState,
            });
        } catch (error) {
            console.error("❌ [ERROR] Internal server error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },
);
