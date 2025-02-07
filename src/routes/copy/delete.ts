import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { books } from "../../db/schema/book";

app.delete("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Supprimer la copie
        const deletedCopy = await db
            .delete(copy)
            .where(sql`${copy.id} = ${id}`)
            .returning();

        if (deletedCopy.length === 0) {
            res.status(404).json({
                message: "Copy not found.",
                copy: `id: ${id}`,
            });
        }

        // Si la copie est supprimée, on diminue la quantité du livre associé
        const bookId = deletedCopy[0].book_id;  // Le livre associé à cette copie

        // Mise à jour de la quantité du livre dans la table 'books'
        await db
            .update(books)
            .set({ quantity: sql`${books.quantity} - 1` })  // Décrémenter la quantité de 1
            .where(sql`${books.id} = ${bookId}`);

        res.status(200).json({
            message: "Copy successfully deleted, and book quantity updated.",
            deletedCopy,
        });
    } catch (error) {
        console.error("Error while deleting the copy:", error);
        res.status(500).json({
            message: "Error while deleting the copy.",
            error,
        });
    }
});
