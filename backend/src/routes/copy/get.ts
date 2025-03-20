import { app } from "../..";
import { db } from "../../app/config/database";
import { sql, eq } from "drizzle-orm";
import { copy, selectCopySchema } from "../../db/schema/copy";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { review } from "../../db/schema/review";
import { NextFunction, Request, Response } from "express";
import { generateBarcodeImage } from "../../app/services/barcode";
import { AppError } from "../../app/utils/AppError";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";

app.get(
    "/copy",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allCopies = await db.select().from(copy);
            const validatedCopies = allCopies.map((c) =>
                selectCopySchema.parse(c),
            );
            res.status(200).json(validatedCopies);
        } catch (error) {
            return next(
                new AppError("Error while retrieving copies.", 500, error),
            );
        }
    },
);

app.get(
    "/copy/:id",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy id provided.", 400, {
                    id: copyId,
                });

            const [selectedCopy] = await db
                .select()
                .from(copy)
                .where(eq(copy.id, copyId))
                .limit(1);

            if (!selectedCopy)
                throw new AppError("Copy not found.", 404, {
                    copy: `id: ${copyId}`,
                });

            res.status(200).json(selectedCopy);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while retrieving the copy.", 500, error),
            );
        }
    },
);

app.get(
    "/books/:id/copy",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bookId = parseInt(req.params.id, 10);
            if (isNaN(bookId) || bookId <= 0)
                throw new AppError("Invalid copy id provided.", 400, {
                    id: bookId,
                });

            const [copies] = await db
                .select({
                    copy_id: copy.id,
                    state: copy.state,
                    is_reserved: copy.is_reserved,
                    is_claimed: copy.is_claimed,
                    book_id: copy.book_id,
                    review_condition: sql`array_agg(${review.condition})`.as(
                        "review_condition",
                    ),
                })
                .from(copy)
                .leftJoin(review, eq(copy.id, review.copy_id))
                .where(eq(copy.book_id, bookId))
                .groupBy(
                    copy.id,
                    copy.state,
                    copy.is_reserved,
                    copy.is_claimed,
                    copy.book_id,
                );

            if (!copies)
                throw new AppError("No copies found for this book.", 404, {
                    id: bookId,
                });

            res.status(200).json(copies);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError(
                    "Error while retrieving copies for book.",
                    500,
                    error,
                ),
            );
        }
    },
);

app.get(
    "/copy/:id/barcode",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const copyId = parseInt(req.params.id, 10);
            if (isNaN(copyId) || copyId <= 0)
                throw new AppError("Invalid copy id provided.", 400, {
                    id: copyId,
                });

            const barcodeBase64 = await generateBarcodeImage(copyId);

            res.setHeader("Content-Type", "image/png");
            res.status(200).send(
                Buffer.from(barcodeBase64.split(",")[1], "base64"),
            );
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError(
                    "Error while generating barcode for copy.",
                    500,
                    error,
                ),
            );
        }
    },
);
