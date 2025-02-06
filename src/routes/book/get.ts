import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { books, SelectBookSchema } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

app.get("/books", checkTokenMiddleware, async (req, res) => {
    try {
        const allBooks = await db.select().from(books);
        const validatedBooks = allBooks.map((books) => {
            return SelectBookSchema.parse(books);
        });
        res.status(200).json(validatedBooks);
    } catch (error) {
        console.error("Error while getting books :", error);
        res.status(500).json({
            message: "Error while getting books.",
            error,
        });
    }
});

app.get("/books/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const Book = await db
            .select()
            .from(books)
            .where(sql`${books.id} = ${id}`);
        if (Book.length === 0) {
            res.status(404).json({
                message: "Book not found.",
                user: `id: ${id}`,
            });
        } else {
            const validatedBooks = Book.map((books) => {
                return SelectBookSchema.parse(books);
            });
            res.status(200).json(validatedBooks);
        }
    } catch (error) {
        console.error("Error while getting book :", error);
        res.status(500).json({
            message: "Error while getting book.",
            error,
        });
    }
});

/**
 * @swagger
 **/
