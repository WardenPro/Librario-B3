import { JWTPayload } from "jose";

declare module "express-serve-static-core" {
    interface Request {
        payload?: JWTPayload;
    }
}
