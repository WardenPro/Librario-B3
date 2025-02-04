import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { users } from "../../db/schema/users";
import { extractBearerToken } from "../../app/middlewares/verify_jwt";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import keys from "../../app/middlewares/key";

app.post("/logout", async (req: any, res: any) => {
    try {
        const token =
            req.headers.auth_token &&
            extractBearerToken(req.headers.auth_token);
        if (!token) {
            return res.status(401).json({ message: "Missing JWT token" });
        }

        const Key = Buffer.from(keys, "hex");
        const { payload } = await jwtVerify(token, Key);

        if (!payload || !payload.user_id) {
            return res
                .status(403)
                .json({ message: "Missing user_id in token" });
        }

        console.log("User_id :", payload.user_id);
        req.user_id = payload.user_id;

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        return res
            .status(500)
            .json({ message: "Erreur interne lors de la déconnexion" });
    }
});
app.post("/logout/:id", async (req: any, res: any) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const token =
            req.headers.auth_token &&
            extractBearerToken(req.headers.auth_token);
        if (!token) {
            return res.status(401).json({ message: "Missing JWT token" });
        }

        const Key = Buffer.from(keys, "hex");
        const { payload } = await jwtVerify(token, Key);

        if (!payload || !payload.role) {
            return res.status(403).json({ message: "Missing role in token" });
        }

        if (payload.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Access denied: Admin role required" });
        }

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user || user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        await db
            .update(users)
            .set({
                revocation_time_at: new Date(),
            })
            .where(eq(users.id, userId));

        return res.status(200).json({ message: "User forcibly logged out" });
    } catch (error) {
        console.error("Erreur lors du logout administrateur:", error);
        return res
            .status(500)
            .json({ message: "Erreur interne lors du logout administrateur" });
    }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur et ajout du token à la liste noire
 *     description: Cette route permet de déconnecter un utilisateur en blacklistant son JWT.
 *     tags:
 *       - Authentification
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         required: true
 *         description: Le token JWT à ajouter à la liste noire, passé dans l'en-tête de la requête.
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwI..."
 *     responses:
 *       200:
 *         description: Déconnexion réussie, token ajouté à la liste noire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing JWT token"
 *       403:
 *         description: Problème avec les informations contenues dans le token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing user_id in token"
 *       500:
 *         description: Erreur interne serveur lors de la déconnexion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne lors de la déconnexion"
 */

/**
 * @swagger
 * /logout/{id}:
 *   post:
 *     summary: Déconnexion forcée d'un utilisateur par un administrateur
 *     description: Permet à un administrateur de forcer la déconnexion d'un utilisateur spécifique en mettant à jour son temps de révocation.
 *     tags:
 *       - Authentification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à déconnecter.
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Déconnexion forcée réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User forcibly logged out"
 *       400:
 *         description: L'ID de l'utilisateur est invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID"
 *       404:
 *         description: L'utilisateur spécifié n'existe pas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Erreur interne serveur lors de la déconnexion forcée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne lors du logout administrateur"
 */
