import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { copy, insertCopySchema } from "../../db/schema/copy";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

app.post(
    "/copy",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for copy creation.", 400);

            const validatedData = insertCopySchema.parse(req.body);
            const [bookExists] = await db
                .select({ id: books.id })
                .from(books)
                .where(eq(books.id, validatedData.book_id))
                .execute();

            if (!bookExists) 
                throw new AppError("The provided book_id does not exist.", 400, { book_id: validatedData.book_id });

            const newCopy = await db
                .insert(copy)
                .values(validatedData)
                .returning()
                .execute();

            res.status(201).json({
                message: "Copy added successfully.",
                newCopy,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(new AppError("Error while adding copy.", 500, error));
        }
    },
);
