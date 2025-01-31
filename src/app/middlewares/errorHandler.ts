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
            "An error occurred while connecting to the database.",
        details: err.message || "Unknown error.",
    });
};