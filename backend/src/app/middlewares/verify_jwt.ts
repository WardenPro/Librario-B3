import { jwtVerify, JWTPayload } from "jose";
import key from "./key";
import { db } from "../config/database";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { Request, Response, NextFunction } from "express";

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
            throw new Error("User not found.");
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
        const authHeader = req.headers["auth_token"];
        const authToken =
            typeof authHeader === "string" ? authHeader : authHeader?.[0];

        if (!authToken) {
            res.status(401).json({ message: "Missing JWT token" });
            return;
        }

        const token = extractBearerToken(authToken) as string;
        const secret_key = Buffer.from(key, "hex");

        const { payload } = await jwtVerify(token, secret_key);
        if (!payload || Object.keys(payload).length === 0) {
            res.status(401).json({ message: "Invalid token payload." });
            return;
        }
        req.payload = payload;

        let revoked;
        try {
            revoked = await isTokenRevoked(payload);
        } catch (error) {
            res.status(500).json({
                message: "Internal error during token verification." + error,
            });
            return;
        }

        if (revoked) {
            res.status(401).json({ message: "Revoked token." });
            return;
        }

        return next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." + error });
        return;
    }
}
