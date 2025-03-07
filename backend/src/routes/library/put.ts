import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { library, insertLibrarySchema } from "../../db/schema/library";

app.put(
    "/library",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for update.", 400);

            const ValidatedLibraryData = insertLibrarySchema.parse(req.body);

            const [updatedLibrary] = await db
                .update(library)
                .set(ValidatedLibraryData)
                .returning();
            if (!updatedLibrary)
                throw new AppError("No changes were made to the library data.", 400);

            res.status(200).json(updatedLibrary);
        } catch (error) {
            if (error instanceof AppError)
                return next(error);
            return next(new AppError("An error occurred while updating the library name.", 500));
        }
    },
);
