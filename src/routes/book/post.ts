import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
import { eq } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";
import ISBN from "node-isbn";

ISBN.provider(["google"]);

app.post(
    "/books/import",
    checkTokenMiddleware,
    
    async (req, res) => {
        try {
            console.log("📌 [INFO] Requête reçue sur /books/import");
            console.log("📌 [INFO] Corps de la requête:", req.body);

            const { isbn } = req.body;

            if (!isbn) {
                console.log("❌ [ERROR] ISBN manquant dans la requête.");
                res.status(400).json({ message: "ISBN is required." });
                return;
            }

            console.log(`📌 [INFO] ISBN reçu: ${isbn}`);

            const isbnRegex = /^(?:\d{9}[xX]|\d{10}|\d{13})$/;
            if (!isbnRegex.test(isbn)) {
                console.log("❌ [ERROR] Format ISBN invalide.");
                res.status(400).json({ message: "Invalid ISBN format." });
                return;
            }

            try {
                console.log("🔎 [INFO] Recherche du livre avec ISBN.resolve()");
                const bookInfo = await ISBN.resolve(isbn);
                console.log("✅ [INFO] Réponse de ISBN.resolve():", bookInfo);

                if (!bookInfo) {
                    console.log("❌ [ERROR] Livre non trouvé via Google Books.");
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
                    quantity: 1,
                    publish_date: bookInfo.publishedDate
                        ? new Date(bookInfo.publishedDate)
                        : new Date(),
                    isbn: parseInt(isbn, 10),
                    image_link: bookInfo.imageLinks?.thumbnail || null,
                    is_removed: false,
                };

                console.log("📌 [INFO] Vérification si le livre existe déjà en base...");
                const existingBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.isbn, isbn))
                    .execute();

                if (existingBook.length > 0) {
                    console.log("⚠️ [WARNING] Livre déjà présent en base.");
                    res.status(409).json({
                        message: "Book already exists in database.",
                    });
                    return;
                }

                console.log("📝 [INFO] Ajout du livre à la base de données...");
                await db.insert(books).values(newBook).execute();
                console.log("✅ [INFO] Livre ajouté en base.");

                res.status(201).json({
                    message: "Book added successfully.",
                    book: newBook,
                });
            } catch (error) {
                console.error("❌ [ERROR] Erreur lors de la récupération du livre:", error);
                res.status(500).json({
                    message: "Error retrieving book information.",
                });
            }
        } catch (error) {
            console.error("❌ [ERROR] Erreur interne:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
);
