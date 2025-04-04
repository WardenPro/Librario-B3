import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.get(
    "/roles/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID provided.", 400);

            const userRoles = await db
                .select({ roles: users.roles })
                .from(users)
                .where(eq(users.id, userId));
            if (userRoles.length === 0) {
                throw new AppError(`User with ID ${userId} not found`, 404);
            } else {
                res.status(200).json(userRoles[0]);
            }
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError(
                    "Internal error during user roles retrieval",
                    500,
                    error,
                ),
            );
        }
    },
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Récupère les rôles d'un utilisateur
 *     tags:
 *       - Utilisateurs
 *     description: Retourne les rôles associés à un utilisateur en fonction de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur dont on veut récupérer les rôles.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: header
 *         name: auth_token
 *         required: true
 *         description: Token JWT pour l'authentification (sans préfixe Bearer).
 *         schema:
 *           type: string
 *           example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMzNDAzODY2LCJleHAiOjE3MzM0MTEwNjZ9.gwwQEThOALj0hh9_n4gKc4vmiGoBC_DXiLSB24JqqG0mOSiEE_TSq7yOZJnlnZoYg1cp2aGTwOzeOsrXf7SbSGd3F1XeYSsvO7yhUZxaIM0BpSKGGJJrPA3rHfnBs7d5gAISY0_DOZExXugn9QPSZDGHl2VAY-HdrX4RBU5JDi7V9FpIsgV149r7bORPgyCtgYVJHZq1kDB1bMTQyrDP6ZI4J9vGUCA732T1A8IOcGC7jiIOIqGSRpZOM6ELmG7pnM0g382IM6gk9QKLZ13AfXqLK2jApgNsfbQLC7dnWn6DPkBcO3xSMJusYkVK273P4g5seYOVYlazMmrTdrLfjw
 *     responses:
 *       200:
 *         description: Rôles de l'utilisateur récupérés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["admin", "user"]
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur avec l'ID 1 non trouvé"
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération des rôles de l'utilisateur."
 */
