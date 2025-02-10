import csurf from "csurf";
import { RequestHandler } from "express";
import { NODE_ENV } from "..";

const csrfProtection: RequestHandler = NODE_ENV
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
