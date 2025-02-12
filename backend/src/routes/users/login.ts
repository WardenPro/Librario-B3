import { app } from "../../app/index";
import { db } from "../../app/config/database";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { argon2Verify } from "hash-wasm";
import { generateToken } from "../../app/middlewares/jwt";
import { Request, Response } from "express";

app.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .execute();

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await argon2Verify({
            password: password,
            hash: user.password,
        });

        if (!isPasswordValid) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }

        const token = await generateToken(user.id, user.roles);

        res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
        console.error("Error while logging in:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: Permet à un utilisateur de se connecter avec son email et mot de passe.
 *     tags:
 *       - Authentification
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         required: true
 *         schema:
 *           type: string
 *         description: Jeton CSRF pour sécuriser la requête.
 *         example: "7UYX2jQV-piwMZs-bU6iQjOGw3gjWb8LhN40"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *                 description: L'adresse email de l'utilisateur.
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *                 description: Le mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Connexion réussie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *       401:
 *         description: Mot de passe incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mot de passe incorrect
 *       404:
 *         description: Utilisateur introuvable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur introuvable
 *       403:
 *         description: Échec de la protection CSRF.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Échec de la vérification CSRF
 *       500:
 *         description: Erreur serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur serveur
 */
