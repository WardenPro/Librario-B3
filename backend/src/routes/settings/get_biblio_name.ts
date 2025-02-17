import { app } from "../../app/index";
import { library } from "../../db/schema/library";
import { db } from "../../app/config/database";
import { Request, Response, NextFunction } from "express";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/library/name",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const [result] = await db.select().from(library).limit(1);

            if (!result) {
                const defaultName = "Bibliothèque par défaut";
                await db.insert(library).values({ name: defaultName });

                res.json({ name: defaultName });
            } else {
                res.json({ name: result.name });
            }
        } catch (error) {
            next(new AppError("An error occurred while fetching the library name.", 500, error));
        }
    },
);
