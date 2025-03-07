import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { users, newUpdateUserSchema } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { grantedAccessMiddleware } from "../../app/middlewares/verify_access_right";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";

export async function updateUser(id: number, data: Request) {
    const validatedData = newUpdateUserSchema.parse(data);

    try {
        const userExists = await db
            .select()
            .from(users)
            .where(eq(users.id, id));
        if (userExists.length === 0)
            throw new AppError("User not found", 404, { id: `${id}` });

        const [updatedUser] = await db
            .update(users)
            .set(validatedData)
            .where(eq(users.id, id))
            .returning();
        if (!updatedUser)
            throw new AppError("No changes were made to the user data.", 400);

        return updatedUser;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(
            "An unknown error occurred while updating the user.",
            500,
            error,
        );
    }
}

app.put(
    "/users/:id",
    checkTokenMiddleware,
    grantedAccessMiddleware("owner", users),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId) || userId <= 0)
                throw new AppError("Invalid user ID provided.", 400);
            if (Object.keys(req.body).length === 0)
                throw new AppError("No data provided for update.", 400);

            const updatedUser = await updateUser(userId, req.body);
            if (!updatedUser)
                throw new AppError(
                    "An error occurred while updating the user.",
                    500,
                );

            res.status(200).json({
                email: updatedUser.email,
                last_name: updatedUser.last_name,
                first_name: updatedUser.first_name,
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            next(
                new AppError(
                    "Internal error while updating the user",
                    500,
                    error,
                ),
            );
        }
    },
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
 *     description: Met à jour les informations d'un utilisateur existant dans la base de données.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               age:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *                 age:
 *                   type: integer
 *                   example: 30
 *       400:
 *         description: Erreur de validation des données fournies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "name"
 *                       message:
 *                         type: string
 *                         example: "Name is required."
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
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur interne est survenue."
 */
