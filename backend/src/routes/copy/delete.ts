import { app } from "../..";
import { db } from "../../app/config/database";
import { sql, eq } from "drizzle-orm";
import { copy } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { books } from "../../db/schema/book";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.delete(
    "/copy/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy id.", 400, { id: copyId });

            const [copyToDelete] = await db
                .select()
                .from(copy)
                .where(eq(copy.id, copyId));
            if (!copyToDelete)
                throw new AppError("Copy not found.", 404, { id: copyId });

            if (copyToDelete.is_reserved || copyToDelete.is_claimed)
                throw new AppError(
                    "Cannot delete a reserved or claimed copy.",
                    403,
                    { id: copyId },
                );

            const [deletedCopy] = await db
                .delete(copy)
                .where(eq(copy.id, copyId))
                .returning();
            if (!deletedCopy)
                throw new AppError("Failed to delete copy.", 500, {
                    id: copyId,
                });

            const bookId = deletedCopy.book_id;

            await db
                .update(books)
                .set({ quantity: sql`GREATEST(${books.quantity} - 1, 0)` })
                .where(eq(books.id, bookId));

            res.status(200).json({
                message:
                    "Copy successfully deleted, and book quantity updated.",
                deletedCopy,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while deleting the copy.", 500, error),
            );
        }
    },
);
