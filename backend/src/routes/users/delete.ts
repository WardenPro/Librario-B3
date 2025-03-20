import { app } from "../..";
import { db } from "../../app/config/database";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

app.delete(
    "/users/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("admin_or_owner", users),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID provided.", 400);

            const User = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));
            if (User.length === 0)
                throw new AppError(`User with ID ${userId} not found`, 404);
            try {
                await db.delete(users).where(eq(users.id, userId));
                res.status(200).json("User deleted successfully.");
            } catch (error) {
                throw new AppError(
                    "Error while deleting the user.",
                    500,
                    error,
                );
            }
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError("Internal error during user deletion", 500, error),
            );
        }
    },
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur par ID
 *     tags:
 *       - Utilisateurs
 *     description: Supprime un utilisateur spécifique en fonction de son ID. Si l'utilisateur n'existe pas, une erreur 404 est renvoyée.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à supprimer.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User delete"
 *       404:
 *         description: Utilisateur non trouvé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé."
 *                 user:
 *                   type: string
 *                   example: "id: 123"
 *       500:
 *         description: Erreur lors de la suppression de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la supression de l'utilisateur."
 *                 error:
 *                   type: string
 */
