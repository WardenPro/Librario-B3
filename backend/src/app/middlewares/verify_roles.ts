import { jwtVerify } from "jose";
import key from "./key";
import { NODE_ENV } from "..";
import { Request, Response, NextFunction } from "express";
import { extractBearerToken } from "./verify_jwt";

export function checkRoleMiddleware(requiredRole?: "admin" | "id") {
    return (req: Request, res: Response, next: NextFunction) => {
        // ✅ Utiliser une fonction auto-exécutée pour gérer l'`async`
        (async () => {
            try {
                // if (NODE_ENV === "development") {
                //     return next();
                // }

                const authHeader = req.headers["auth_token"];
                const authToken = typeof authHeader === "string" ? authHeader : authHeader?.[0];
                // ✅ Vérification correcte de l'en-tête `authorization`

                if (!authToken) {
                    return res.status(401).json({ message: "Missing JWT token" });
                }
                
                const token = extractBearerToken(authToken) as string;
                const secret_key = Buffer.from(key, "hex");
                const { payload } = await jwtVerify(token, secret_key);

                if (!payload || !payload.role || !payload.user_id) {
                    return res.status(403).json({ message: "Missing role or ID in token" });
                }

                const userRole: string = payload.role as string;
                const userId: number = payload.user_id as number;

                console.log("🔹 Utilisateur:", { userId, userRole });

                const requestedId = parseInt(req.params.id, 10);

                if (requiredRole === "id" && requestedId !== userId) {
                    return res.status(403).json({ message: "Access denied: not your account" });
                }

                if (requiredRole === "admin" && userRole !== "admin") {
                    return res.status(403).json({ message: "Access denied: admin only" });
                }

                // ✅ Vérification finale : ID ou rôle admin
                if (requestedId !== userId && userRole !== "admin") {
                    return res.status(403).json({ message: "Access denied" });
                }

                console.log("✅ Accès autorisé :", userRole);
                return next();
            } catch (error) {
                console.error("❌ Erreur lors de la vérification du JWT :", error);
                return next(error); // ✅ Transmet l'erreur correctement à Express
            }
        })();
    };
}
