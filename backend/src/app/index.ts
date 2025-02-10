import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import "./middlewares/key";
import cors from "cors";
import dotenv from "dotenv";
import csrf from "csurf";

export const app = express();
dotenv.config();
export let NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
    throw new Error("NODE_ENV is not defined in environment variables.");
}

// Configuration des options CORS
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV === "development") {
            callback(null, true);
        } else {
            const allowedOrigins = [/^https?:\/\/(.*\.)?pfb\.ecole-89\.com$/];

            if (
                origin &&
                allowedOrigins.some((pattern) => pattern.test(origin))
            ) {
                callback(null, origin);
            } else {
                callback(new Error("Origin not allowed by CORS"));
            }
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
};

// Middleware de sécurité
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware CSRF Protection
const csrfProtection = csrf({
    cookie: {
        httpOnly: true, // Empêche l'accès client au cookie
        secure: process.env.NODE_ENV === "production", // Active Secure en prod
        sameSite: "strict", // Empêche l'envoi du cookie en cross-site
    },
});

app.use(csrfProtection);

// Route pour envoyer le token CSRF au frontend
app.get("/api/csrf-token", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken(), {
        httpOnly: false, // Permet au client d’accéder au token CSRF
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.json({ csrfToken: req.csrfToken() });
});

// Exemple de route protégée
app.post("/api/protected", (req, res) => {
    res.json({ message: "Requête CSRF sécurisée réussie !" });
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Gestion des erreurs
app.use(errorHandler);
