import { SignJWT } from "jose";
import keys from "./key";

export async function generateToken(user_id: number, role: string) {
    try {
        const Key = Buffer.from(keys.rsa, "hex");

        const jwt = await new SignJWT({
            user_id,
            role,
        })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(Key);

        return jwt;
    } catch (error) {
        console.error("Erreur lors de la génération du JWT :", error);
        throw new Error("Impossible de générer le token.");
    }
}