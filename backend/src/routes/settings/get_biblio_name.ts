import { app } from "../../app/index";
import { library } from "../../db/schema/library";
import { db } from "../../app/config/database";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

app.get("/library/name", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await db.select().from(library).limit(1);

        if (!result.length) {
            const defaultName = "Bibliothèque par défaut";
            await db.insert(library).values({ name: defaultName });

            res.json({ name: defaultName });
            return;
        }
        if (!result.length) {
            throw new AppError("Name not found", 404);
        }

        res.json({ name: result[0].name });
    } catch (error) {
        next(error);
    }
});
