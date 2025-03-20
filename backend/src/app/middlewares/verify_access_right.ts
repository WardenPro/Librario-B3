import { db } from "../config/database";
import { NODE_ENV } from "../..";
import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/AppError";
import { users } from "../../db/schema/users";

export function grantedAccessMiddleware(
    accessType: "owner" | "admin" | "admin_or_owner",
    schema?: any,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            //inversed the condition to test it
            if (NODE_ENV !== "development") return next();
            if (!req.payload?.user_id || !req.payload?.role)
                return next(
                    new AppError("Unauthorized: No user ID in token.", 401),
                );

            const userIdFromToken = req.payload.user_id;
            const isAdmin = req.payload.role === "admin";

            if (accessType === "admin" && !isAdmin)
                return next(new AppError("Access denied: Admin only.", 403));
            else if (accessType === "admin" && isAdmin) return next();
            if (!schema)
                return next(
                    new AppError("Schema not provided for access verification.", 500),
                );

            const resourceId = parseInt(req.params.id, 10);
            if (isNaN(resourceId) || resourceId <= 0)
                return next(
                    new AppError("Invalid ID provided.", 400, {
                        id: resourceId,
                    }),
                );
            
            let resource = null;
            if (schema === users) {
                [resource] = await db.
                    select({ user_id: schema.id })
                    .from(schema)
                    .where(eq(schema.id, resourceId));
            } else {
                [resource] = await db
                    .select({ user_id: schema.user_id })
                    .from(schema)
                    .where(eq(schema.id, resourceId));
            }

            if (!resource)
                return next(
                    new AppError("Resource not found.", 404, {
                        id: resourceId,
                    }),
                );

            const isOwner = resource.user_id === userIdFromToken;

            if (accessType === "owner" && !isOwner)
                return next(
                    new AppError("Access denied: Not the owner.", 403, {
                        id: resourceId,
                    }),
                );

            if (accessType === "admin_or_owner" && !isOwner && !isAdmin)
                return next(
                    new AppError("Access denied: Admin or owner only.", 403, {
                        id: resourceId,
                    }),
                );

            next();
        } catch (error) {
            console.error(error);
            next(new AppError("Error while verifying access.", 500, error));
        }
    };
}
