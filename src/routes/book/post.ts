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
            console.log("📌 [INFO] Requête reçue sur /books/import");
            console.log("📌 [INFO] Corps de la requête:", req.body);

            const { isbn, quantity } = req.body;

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

            // Vérification et définition d'une quantité valide
            const parsedQuantity = parseInt(quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity < 1) {
                console.log("⚠️ [WARNING] Quantité invalide, valeur par défaut 1 appliquée.");
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
                    quantity: parsedQuantity > 0 ? parsedQuantity : 1, // Utilisation de la quantité choisie
                    publish_date: bookInfo.publishedDate
                        ? new Date(bookInfo.publishedDate)
                        : new Date(),
                    isbn: parseInt(isbn, 10),
                    image_link: bookInfo.imageLinks?.thumbnail || null,
                    is_removed: false,
                };

                console.log("📌 [INFO] Vérification si l'ISBN est déjà en base...");

                // Vérification 1 : L'ISBN est-il déjà présent en base ?
                const existingIsbnBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.isbn, newBook.isbn))
                    .execute();

                if (existingIsbnBook.length > 0) {
                    console.log("❌ [ERROR] Un livre avec cet ISBN existe déjà.");
                    res.status(409).json({
                        message: "A book with this ISBN already exists in the database.",
                    });
                    return;
                }

                console.log("📌 [INFO] Vérification si un livre avec le même nom, auteur et éditeur existe déjà...");

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
                    console.log("❌ [ERROR] Un livre avec le même nom, auteur et éditeur existe déjà.");
                    res.status(409).json({
                        message: "A book with the same title, author, and publisher already exists in the database.",
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
