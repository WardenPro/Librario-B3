import { SignJWT } from "jose";
import key from "./key";

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
        console.error("Error during JWT generation:", error);
        throw new Error("Unable to generate the token.");
    }
}