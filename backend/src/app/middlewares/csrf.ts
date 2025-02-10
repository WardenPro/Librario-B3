import csrf from "csurf";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";

// Initialisation du middleware CSRF avec stockage du token dans un cookie sécurisé
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Empêche l'accès au cookie côté client
    secure: process.env.NODE_ENV === "production", // Active Secure en prod
    sameSite: "strict", // Empêche l'envoi du cookie en cross-site
  },
});

// Middleware pour envoyer le token CSRF au client
export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    httpOnly: false, // Permet au client d'accéder au token CSRF (Next.js, React, etc.)
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  next();
};
