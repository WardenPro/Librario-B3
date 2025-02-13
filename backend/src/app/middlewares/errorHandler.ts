import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { NODE_ENV } from "../index";
import { errorMessage } from "../utils/logger";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    errorMessage("Error occurred:", {
        message: err.message,
        stack: err.stack,
        route: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "An unexpected error occurred";

    res.status(statusCode).json({
        success: false,
        message: message,
        details: err instanceof AppError ? err.details : undefined,
        details_error:
            NODE_ENV === "development"
                ? {
                    stack: err.stack ? err.stack.split("\n") : undefined,
                    originalError:
                        err instanceof AppError && err.error
                            ? err.error.stack?.split("\n")
                            : undefined,
                }
                : undefined,
    });
};
