import fetch from "node-fetch";
import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
import { eq } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

app.post("/books/import", checkTokenMiddleware, checkRoleMiddleware, async (req, res) => {
    try {
        const { isbn } = req.body;

        const googleResponse = await fetch(`${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}`);
        const googleData = (await googleResponse.json()) as {
        items?: { volumeInfo: { title: string; authors?: string[]; publishedDate?: string; description?: string } }[];
            };


        if (!googleData.items || googleData.items.length === 0) {
            res.status(404).json({ message: "Book not found in Google Books API." });
        }
        const bookInfo = googleData.items?.[0]?.volumeInfo ?? { title: "Unknown", authors: ["Unknown"], publishedDate: "Unknown", description: "No description available" };


        
        const newBook = {
            name: bookInfo.title, // Nom du livre
            description: bookInfo.description || "No description available",
            type: "book", // Définis un type par défaut
            category: "Unknown", // Ajoute une catégorie appropriée
            publisher: "publisher" in bookInfo ? bookInfo.publisher! : "Unknown", // Vérifie si publisher existe
            author: bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown",
            quantity: 1,
            publish_date: bookInfo.publishedDate ? new Date(bookInfo.publishedDate) : new Date(), // Conversion en date
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
            res.status(409).json({ message: "Book already exists in database." });
        }

        await db.insert(books).values(newBook).execute();

        res.status(201).json({ message: "Book added successfully.", book: newBook });

    } catch (error) {
        console.error("Error importing book:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});