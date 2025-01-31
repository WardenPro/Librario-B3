import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message:
            "Une erreur est survenue lors de la connexion à la base de données.",
        details: err.message || "Erreur inconnue",
    });
};