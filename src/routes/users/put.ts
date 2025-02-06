import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { users, updateUserSchema } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";

export async function updateUser(id: number, data: any) {
    const validatedData = updateUserSchema.parse(data);

    try {
        const userExists = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .execute();

        if (userExists.length === 0) {
            throw new Error("User not found");
        }

        await db
            .update(users)
            .set(validatedData)
            .where(eq(users.id, id))
            .execute();

        const updatedUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .execute();

        return updatedUser[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error updating user: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating the user.",
            );
        }
    }
}

app.put("/users/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        const updatedUser = await updateUser(userId, req.body);

        res.status(200).json(updatedUser);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                message: "Validation error",
                errors: error.errors.map((issue) => ({
                    path: issue.path,
                    message: issue.message,
                })),
            });
        }
        if (error instanceof Error && error.message === "User not found") {
            res.status(404).json({ message: "User not found." });
        } else {
            console.error(error);
            res.status(500).json({
                message: "An internal error occurred.",
            });
        }
    }
});

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
