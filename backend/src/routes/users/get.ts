import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { sql } from "drizzle-orm";
import { users, selectUserSchema } from "../../db/schema/users";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

app.get("/users", checkTokenMiddleware, checkRoleMiddleware("admin"), async (req, res) => {
    try {
        const allUsers = await db.select().from(users);
        const validatedUsers = allUsers.map((user) => {
            return selectUserSchema.parse(user);
        });
        res.status(200).json(validatedUsers);
    } catch (error) {
        console.error("Error while retrieving users:", error);
        res.status(500).json({
            message: "Error while retrieving users.",
            error,
        });
    }
});

app.get("/users/:id", checkTokenMiddleware, checkRoleMiddleware("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const User = await db
            .select()
            .from(users)
            .where(sql`${users.id} = ${id}`);
        if (User.length === 0) {
            res.status(404).json({
                message: "User not found.",
                user: `id: ${id}`,
            });
        } else {
            const validatedUsers = User.map((user) => {
                return selectUserSchema.parse(user);
            });
            res.status(200).json(validatedUsers);
        }
    } catch (error) {
        console.error("Error while retrieving the user:", error);
        res.status(500).json({
            message: "Error while retrieving the user.",
            error,
        });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags:
 *       - Utilisateurs
 *     description: Retourne une liste de tous les utilisateurs présents dans la base de données.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID unique de l'utilisateur.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Nom de l'utilisateur.
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     description: Adresse email de l'utilisateur.
 *                     example: "johndoe@example.com"
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération des utilisateurs."
 *                 error:
 *                   type: object
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
 *     description: Retourne les détails d'un utilisateur spécifique en fonction de son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à récupérer.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID unique de l'utilisateur.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Nom de l'utilisateur.
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   description: Adresse email de l'utilisateur.
 *                   example: "johndoe@example.com"
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
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération de l'utilisateur."
 *                 error:
 *                   type: object
 */
