import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { copy, selectCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { review } from "../../db/schema/review";

app.get("/copy", checkTokenMiddleware, async (req, res) => {
    try {
        const allCopies = await db.select().from(copy);
        const validatedCopies = allCopies.map((c) => selectCopySchema.parse(c));
        res.status(200).json(validatedCopies);
    } catch (error) {
        console.error("Error while retrieving copies:", error);
        res.status(500).json({
            message: "Error while retrieving copies.",
            error,
        });
    }
});

app.get("/copy/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const foundCopy = await db
            .select()
            .from(copy)
            .where(sql`${copy.id} = ${id}`);

        if (foundCopy.length === 0) {
            res.status(404).json({
                message: "Copy not found.",
                copy: `id: ${id}`,
            });
        } else {
            const validatedCopies = foundCopy.map((c) =>
                selectCopySchema.parse(c),
            );
            res.status(200).json(validatedCopies);
        }
    } catch (error) {
        console.error("Error while retrieving the copy:", error);
        res.status(500).json({
            message: "Error while retrieving the copy.",
            error,
        });
    }
});

app.get("/copy/book/:bookId", checkTokenMiddleware, async (req, res) => {
    try {
        const { bookId } = req.params;

        const copies = await db
            .select({
                copy_id: copy.id,
                state: copy.state,
                is_reserved: copy.is_reserved,
                is_claimed: copy.is_claimed,
                copy_number: copy.copy_number,
                book_id: copy.book_id,
                review_condition: sql`array_agg(${review.condition})`.as('review_condition')
            })
            .from(copy)
            .leftJoin(review, sql`${copy.id} = ${review.copy_id}`)
            .where(sql`${copy.book_id} = ${bookId}`)
            .groupBy(copy.id, copy.state, copy.is_reserved, copy.is_claimed, copy.copy_number, copy.book_id);

        if (copies.length === 0) {
            res.status(404).json({
                message: "No copies found for this book.",
                book_id: bookId,
            });
        }

        res.status(200).json(copies);
    } catch (error) {
        console.error("Error while retrieving copies and reviews for book:", error);
        res.status(500).json({
            message: "Error while retrieving copies and reviews for book.",
            error,
        });
    }
});


