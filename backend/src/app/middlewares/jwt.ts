import { SignJWT } from "jose";
import key from "./key";
import { AppError } from "../utils/AppError";

export async function generateToken(user_id: number, role: string) {
    try {
        const secret_key = Buffer.from(key, "hex");

        const jwt = await new SignJWT({
            user_id,
            role,
        })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret_key);

        return jwt;
    } catch (error) {
        throw new AppError("Unable to generate the token.", 500, error);
    }
}
