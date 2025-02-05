import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { books, updateBookSchema } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

export async function updateBookQuantity(
    id: number,
    data: { quantity: number },
) {
    const validatedData = updateBookSchema.parse(data);
    try {
        const bookExists = await db
            .select()
            .from(books)
            .where(eq(books.id, id))
            .execute();

        if (bookExists.length === 0) {
            throw new Error("Book not found");
        }

        await db
            .update(books)
            .set({ quantity: validatedData.quantity })
            .where(eq(books.id, id))
            .execute();

        const updatedBook = await db
            .select()
            .from(books)
            .where(eq(books.id, id))
            .execute();

        return updatedBook[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error updating book: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating the book.",
            );
        }
    }
}

app.put("/books/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const BookId = parseInt(req.params.id, 10);

        const { quantity } = req.body;
        if (typeof quantity !== "number") {
            res.status(400).json({ message: "Quantity must be a number." });
        }

        const updatedBook = await updateBookQuantity(BookId, { quantity });

        res.status(200).json(updatedBook);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                message: "Validation error",
                errors: error.errors.map((issue) => ({
                    path: issue.path,
                    message: issue.message,
                })),
            });
        }
        if (error instanceof Error && error.message === "Book not found.") {
            res.status(404).json({ message: "Book not found." });
        } else {
            console.error(error);
            res.status(500).json({
                message: "Error while updating the book.",
            });
        }
    }
});

app.put(
    "/books/archiving/:id",
    checkTokenMiddleware,
    checkRoleMiddleware,
    async (req, res) => {
        try {
            const bookId = parseInt(req.params.id, 10);

            const Book = await db
                .select()
                .from(books)
                .where(eq(books.id, bookId))
                .execute();

            if (Book.length === 0) {
                res.status(404).json({
                    message: "Book not found.",
                    books: `id: ${bookId}`,
                });
            }

            await db
                .update(books)
                .set({ is_removed: true })
                .where(eq(books.id, bookId))
                .execute();

            res.status(200).json({
                message: "Book successfully archived.",
                bookId: bookId,
            });
        } catch (error) {
            console.error("Error while getting books :", error);
            res.status(500).json({
                message: "Error while getting books.",
                error,
            });
        }
    },
);

/**
 * @swagger
 **/
