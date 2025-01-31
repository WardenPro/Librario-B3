import { jwtVerify } from "jose";
import keys from "./key";
import { IS_PRODUCTION } from "..";

const extractBearerToken = (headerValue: string) => {
    if (typeof headerValue !== "string") {
        return false;
    }
    return headerValue.trim();
};

export async function checkRoleMiddleware(req: any, res: any, next: any) {
    try {
        if(!IS_PRODUCTION)
            return
        const token =
            req.headers.auth_token &&
            extractBearerToken(req.headers.auth_token);
        if (!token) {
            return res.status(401).json({ message: "Missing JWT token" });
        }
        const Key = Buffer.from(keys.rsa, "hex");
        const { payload } = await jwtVerify(token, Key);

        if (!payload || !payload.role) {
            return res.status(403).json({ message: "Missing role in token" });
        }
        const role = payload.role as string;
        const validRoles = ["admin"];
        if (!validRoles.includes(role)) {
            return res
                .status(403)
                .json({ message: "Access denied: invalid role" });
        }

        console.log("Rôle de l'utilisateur :", payload.role);
        req.user = payload;
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification du JWT :", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}