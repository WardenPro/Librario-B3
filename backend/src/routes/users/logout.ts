import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../app/utils/AppError";

app.post(
    "/logout/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID provided.", 400);

            const user = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)
                .execute();

            if (!user || user.length === 0)
                throw new AppError(`User with ID ${userId} not found`, 404);

            await db
                .update(users)
                .set({
                    revocation_time_at: new Date(),
                })
                .where(eq(users.id, userId))
                .execute();

            res.status(200).json({ message: "User forcibly logged out" });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(new AppError("Internal error during user logout", 500, error));
        }
    },
);

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
