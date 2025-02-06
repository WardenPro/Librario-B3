import { app } from "../../app/index";
import { db } from "../../app/config/database";
import xss from "xss";
import { users, insertUserSchema } from "../../db/schema/users";
import { generateToken } from "../../app/middlewares/jwt";
import { argon2id } from "hash-wasm";
import { checkRoleMiddleware } from "../../app/middlewares/verify_roles";

app.post(
    "/registration",
    /*checkRoleMiddleware,*/
    async (req, res) => {
        try {
            const sanitizedBody = {
                last_name: req.body.last_name,
                first_name: req.body.first_name,
                password: req.body.password,
                email: req.body.email,
                comment: xss(req.body.comment),
                roles: req.body.roles,
            };

            const salt = new Uint8Array(16);
            crypto.getRandomValues(salt);
            const hashedPassword = await argon2id({
                password: sanitizedBody.password,
                salt,
                parallelism: 1,
                iterations: 2,
                memorySize: 19456,
                hashLength: 32,
                outputType: "encoded",
            });

            const validatedInsert = insertUserSchema.parse(sanitizedBody);
            validatedInsert.password = hashedPassword;

            const [result] = await db
                .insert(users)
                .values(validatedInsert)
                .returning({ id: users.id })
                .execute();

            if (!result) {
                throw new Error("Insertion failed, no ID returned.");
            }

            const token = await generateToken(result.id, validatedInsert.roles);

            res.status(201).json({
                message: "User successfully inserted",
                token: token,
            });
        } catch (error) {
            console.error("Error while inserting user:", error);

            if (
                error instanceof Error &&
                "code" in error &&
                error["code"] === "ER_DUP_ENTRY"
            ) {
                res.status(400).json({
                    message: "This email is already in use.",
                });
            } else {
                res.status(500).json({
                    message: "Error while inserting user.",
                    error: error,
                });
            }
        }
    },
);


/**
 * @swagger
 * /registration:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Insère un nouvel utilisateur dans la base de données après validation, désinfection des données, et vérification CSRF.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur.
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *                 example: StrongPassword123
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email de l'utilisateur.
 *                 example: johndoe@example.com
 *               comment:
 *                 type: string
 *                 description: Commentaire optionnel de l'utilisateur.
 *                 example: Ce compte est pour usage personnel.
 *               roles:
 *                 oneOf:
 *                   - type: string
 *                     enum:
 *                       - admin
 *                       - user
 *                 description: Rôle attribué à l'utilisateur (doit être l'une des valeurs spécifiées).
 *                 example: admin
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         required: true
 *         schema:
 *           type: string
 *         description: Jeton CSRF pour sécuriser la requête.
 *         example: "1234567890abcdef"
 *     responses:
 *       201:
 *         description: Utilisateur inséré avec succès.
 *         headers:
 *           auth_token:
 *             description: Jeton JWT généré pour l'utilisateur.
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur inséré avec succès
 *                 token:
 *                   type: string
 *                   description: Jeton JWT généré pour l'utilisateur.
 *       400:
 *         description: Erreur de validation ou email déjà utilisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cet email est déjà utilisé.
 *       403:
 *         description: Jeton CSRF manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jeton CSRF invalide.
 *       500:
 *         description: Erreur lors de l'insertion de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur lors de l'insertion de utilisateur.
 *                 error:
 *                   type: object
 *                   description: Informations détaillées sur l'erreur.
 */
