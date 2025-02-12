import { NODE_ENV } from "..";
import { Request, Response, NextFunction } from "express";

export function grantedAccessMiddleware(requiredRole?: "admin" | "id") {
    return (req: Request, res: Response, next: NextFunction) => {
        (async () => {
            try {
                //inversed the condition to test it
                if (NODE_ENV !== "development") {
                    next();
                    return;
                }

                const payload = req.payload;

                if (!payload || !payload.role || !payload.user_id) {
                    res.status(403).json({
                        message: "Missing role or ID in token",
                    });
                    return;
                }

                const userRole: string = payload.role as string;
                const userId: number = payload.user_id as number;

                const requestedId = parseInt(req.params.id, 10);

                if (requiredRole === "id" && requestedId !== userId) {
                    res.status(403).json({
                        message: "Access denied: not your account",
                    });
                    return;
                }

                if (requiredRole === "admin" && userRole !== "admin") {
                    res.status(403).json({
                        message: "Access denied: admin only",
                    });
                    return;
                }

                if (requestedId !== userId && userRole !== "admin") {
                    res.status(403).json({ message: "Access denied" });
                    return;
                }

                next();
            } catch (error) {
                console.error("Error during access verification:", error);
                next(error);
            }
        })();
    };
}
