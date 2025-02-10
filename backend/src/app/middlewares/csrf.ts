import csurf from "csurf";
import { RequestHandler } from "express";
import { IS_PRODUCTION } from "..";

const csrfProtection: RequestHandler = IS_PRODUCTION
    ? csurf({
          cookie: {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
              path: "/",
          },
      })
    : (req, res, next) => next();

export { csrfProtection };
