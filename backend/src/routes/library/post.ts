import { app } from "../..";
import { db } from "../../app/config/database";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { library, insertLibrarySchema } from "../../db/schema/library";

app.post(
    "/library",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for update.", 400);

            const ValidatedLibraryData = insertLibrarySchema.parse(req.body);

            const [newLibrary] = await db
                .update(library)
                .set(ValidatedLibraryData)
                .returning();
            if (!newLibrary)
                throw new AppError(
                    "Failed to add library data.",
                    500,
                );

            res.status(200).json(newLibrary);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError(
                    "An error occurred while adding the library data.",
                    500,
                ),
            );
        }
    },
);
