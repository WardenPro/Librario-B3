import { jwtVerify, JWTPayload } from "jose";
import key from "./key";
import { db } from "../config/database";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

export const extractBearerToken = (headerValue: string) => {
    if (typeof headerValue !== "string") {
        return false;
    }
    return headerValue.trim();
};

async function isTokenRevoked(payload: JWTPayload) {
    try {
        if (
            !payload ||
            typeof payload.iat !== "number" ||
            typeof payload.user_id !== "number"
        ) {
            throw new Error("Invalid payload.");
        }

        const payloadId = payload.user_id;
        const tokenCreationTime = new Date(payload.iat * 1000);

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, payloadId))
            .limit(1);

        if (!user || user.length === 0) {
            throw new AppError("User not found, id:" + payloadId, 404);
        }

        const userData = user[0];

        if (
            userData.revocation_time_at &&
            new Date(userData.revocation_time_at) > tokenCreationTime
        ) {
            return true;
        }

        return false;
    } catch (error) {
        throw new Error("Error during JWT revocation check." + error);
    }
}

export async function checkTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const authToken = req.headers["auth_token"];
        if (
            !authToken ||
            typeof authToken !== "string" ||
            authToken.length === 0
        )
            throw new AppError("Missing JWT token", 401);

        const token = extractBearerToken(authToken);
        if (!token) throw new AppError("Invalid token", 500);

        const secret_key = Buffer.from(key, "hex");

        const { payload } = await jwtVerify(token, secret_key);
        if (!payload || Object.keys(payload).length === 0)
            throw new AppError("Invalid token payload", 401);

        req.payload = payload;

        let revoked;
        try {
            revoked = await isTokenRevoked(payload);
        } catch (error) {
            throw new AppError(
                "Error during JWT revocation check.",
                500,
                error,
            );
        }

        if (revoked) throw new AppError("Relogin is required.", 401);

        next();
    } catch (error) {
        next(error);
    }
}
