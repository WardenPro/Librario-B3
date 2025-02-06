import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
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

            const { isbn, quantity } = req.body;

            if (!isbn) {
                console.log("❌ [ERROR] ISBN missing in the request.");
                res.status(400).json({ message: "ISBN is required." });
                return;
            }

            console.log(`📌 [INFO] ISBN get: ${isbn}`);

            const isbnRegex = /^(?:\d{9}[xX]|\d{10}|\d{13})$/;
            if (!isbnRegex.test(isbn)) {
                console.log("❌ [ERROR] Invalid ISBN format.");
                res.status(400).json({ message: "Invalid ISBN format." });
                return;
            }

            // Vérification et définition d'une quantité valide
            const parsedQuantity = parseInt(quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                console.log("⚠️ [WARNING] Invalid quantity, value 1 by default.");
            }

            try {
                const bookInfo = await ISBN.resolve(isbn);

                if (!bookInfo) {
                    console.log("❌ [ERROR] Book not foud with Google Books.");
                    res.status(404).json({ message: "Book not found." });
                    return;
                }

                const newBook = {
                    name: bookInfo.title || "Unknown",
                    description:
                        bookInfo.description || "No description available",
                    type: "book",
                    category: "Unknown",
                    publisher: bookInfo.publisher || "Unknown",
                    author: bookInfo.authors
                        ? bookInfo.authors.join(", ")
                        : "Unknown",
                    quantity: parsedQuantity > 0 ? parsedQuantity : 1, // Utilisation de la quantité choisie
                    publish_date: bookInfo.publishedDate
                        ? new Date(bookInfo.publishedDate)
                        : new Date(),
                    isbn: parseInt(isbn, 10),
                    image_link: bookInfo.imageLinks?.thumbnail || null,
                    is_removed: false,
                };

                console.log("📌 [INFO] Verification if ISBN is in the database");

                // Vérification 1 : L'ISBN est-il déjà présent en base ?
                const existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.isbn, newBook.isbn))
                    .execute();

                if (existingIsbnBook.length > 0) {
                    console.log("❌ [ERROR] A book with this ISBN already exists in the database.");
                    res.status(409).json({
                        message: "A book with this ISBN already exists in the database.",
                    });
                    return;
                }

                console.log("📌 [INFO] Verification if a book with this Name, Auhtor and Publisher already exist.");

                // Vérification 2 : Un livre avec le même titre, auteur et éditeur existe-t-il ?
                const existingSimilarBook = await db
                    .select()
                    .from(books)
                    .where(
                        and(
                            eq(books.name, newBook.name),
                            eq(books.author, newBook.author),
                            eq(books.publisher, newBook.publisher)
                        )
                    )
                    .execute();

                if (existingSimilarBook.length > 0) {
                    console.log("❌ [ERROR] A book with the same title, author, and publisher already exists in the database.");
                    res.status(409).json({
                        message: "A book with the same title, author, and publisher already exists in the database.",
                    });
                    return;
                }

                console.log("📝 [INFO] Adding book in database ...");
                await db.insert(books).values(newBook).execute();
                console.log("✅ [INFO] Book added successfully.");

                res.status(201).json({
                    message: "Book added successfully.",
                    book: newBook,
                });
            } catch (error) {
                console.error("❌ [ERROR] Error retrieving book information.", error);
                res.status(500).json({
                    message: "Error retrieving book information.",
                });
            }
        } catch (error) {
            console.error("❌ [ERROR] Internal server error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
);
