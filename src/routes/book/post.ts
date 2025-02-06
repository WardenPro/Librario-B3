import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
import { eq } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";
import ISBN from "node-isbn";

ISBN.provider(["google"])
    .resolve("0735619670")
    .then(function (book) {
        console.log("Book found %j", book);
    })
    .catch(function (err) {
        console.log("Book not found", err);
    });

app.post(
    "/books/import",
    checkTokenMiddleware,
    checkRoleMiddleware,
    async (req, res) => {
        try {
            const { isbn } = req.body;

            if (!isbn) {
                res.status(400).json({ message: "ISBN is required." });
                return;
            }

            const isbnRegex = /^(?:\d{9}[xX]|\d{10}|\d{13})$/;
            if (!isbnRegex.test(isbn)) {
                res.status(400).json({ message: "Invalid ISBN format." });
                return;
            }

            try {
                const bookInfo = await ISBN.resolve(isbn);

                if (!bookInfo) {
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

                const existingBook = await db
                    .select()
                    .from(books)
                    .where(eq(books.isbn, isbn))
                    .execute();

                if (existingBook.length > 0) {
                    res.status(409).json({
                        message: "Book already exists in database.",
                    });
                    return;
                }

                await db.insert(books).values(newBook).execute();

                res.status(201).json({
                    message: "Book added successfully.",
                    book: newBook,
                });
            } catch (error) {
                console.error("Error retrieving book information:", error);
                res.status(500).json({
                    message: "Error retrieving book information.",
                });
            }
        } catch (error) {
            console.error("Error importing book:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },
);
