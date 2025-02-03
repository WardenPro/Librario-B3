import { jwtVerify, JWTPayload } from "jose";
import key from "./key";
import { db } from "../config/database";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users";

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
        throw new Error("Error during JWT revocation check.");
    }
}

export async function checkTokenMiddleware(req: any, res: any, next: any) {
    try {
        const token =
            req.headers.auth_token &&
            extractBearerToken(req.headers.auth_token);
        if (!token) {
            return res.status(401).json({ message: "Token JWT manquant" });
        }

        const secret_key = Buffer.from(key, "hex");

        const { payload } = await jwtVerify(token, secret_key);

        let revoked;
        try {
            revoked = await isTokenRevoked(payload);
        } catch (error) {
            return res.status(500).json({
                message: "Internal error during token verification.",
            });
        }

        if (revoked) {
            return res.status(401).json({ message: "Revoked token." });
        }

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
}
