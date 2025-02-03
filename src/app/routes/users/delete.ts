import { app } from "@/app/index";
import { db } from "@/app/config/database";
import { sql } from "drizzle-orm";
import { users } from "@/db/schema/users";
import { checkTokenMiddleware } from "@/app/middlewares/verify_jwt";

app.delete("/users/:id", checkTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const User = await db
            .select()
            .from(users)
            .where(sql`${users.id} = ${id}`);
        if (User.length === 0) {
            res.status(404).json({
                message: "Utilisateur non trouvé.",
                user: `id: ${id}`,
            });
        } else {
            try {
                await db.delete(users).where(sql`${users.id} = ${id}`);
                res.status(200).json("User delete");
            } catch (error) {
                console.error(
                    "Erreur lors de la supression de l'utilisateur.",
                    error,
                );
                res.status(500).json({
                    message: "Erreur lors de la supression de l'utilisateur.",
                    error,
                });
            }
        }
    } catch (error) {
        console.error("Erreur lors de la supression de l'utilisateur.", error);
        res.status(500).json({
            message: "Erreur lors de la supression de l'utilisateur.",
            error,
        });
    }
});

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
