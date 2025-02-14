import { app } from "../../app/index";
import { library } from "../../db/schema/library";
import { db } from "../../app/config/database";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";

app.patch(
    "/library/name",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { newName } = req.body;

            if (!newName || typeof newName !== "string") {
                throw new AppError("The library name is required and must be a string.", 400);
            }

            await db.update(library).set({ name: newName });

            res.status(200).json({
                message: "Library name successfully updated.",
                library: {
                    name: newName,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);
