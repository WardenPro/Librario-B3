import { NODE_ENV } from "..";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function grantedAccessMiddleware(requiredRole?: "admin" | "id") {
    return (req: Request, res: Response, next: NextFunction) => {
        (async () => {
            try {
                //inversed the condition to test it
                if (NODE_ENV !== "development") {
                    return next();
                }

                const payload = req.payload;

                if (!payload || !payload.role || !payload.user_id) {
                    return next(
                        new AppError("Missing role or ID in token", 403),
                    );
                }

                const userRole: string = payload.role as string;
                const userId: number = payload.user_id as number;

                const requestedId = parseInt(req.params.id, 10);

                if (requiredRole === "id" && requestedId !== userId)
                    return next(
                        new AppError("Access denied: not your account", 403),
                    );

                if (requiredRole === "admin" && userRole !== "admin")
                    return next(new AppError("Access denied: admin only", 403));

                if (requestedId !== userId && userRole !== "admin")
                    return next(new AppError("Access denied", 403));

                next();
            } catch (error) {
                next(error);
            }
        })();
    };
}
