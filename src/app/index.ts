import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "./middlewares/key";
import cors from "cors";
import "../scheduler/pingMachines";
import "../scheduler/clearBlacklist";

export const app = express();
export const IS_PRODUCTION = process.env.IS_PRODUCTION;

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (process.env.IS_PRODUCTION === "false") {
            callback(null, true);
        } else {
            const allowedOrigins = [/^https?:\/\/(.*\.)?pfb\.ecole-89\.com$/];

            if (
                origin &&
                allowedOrigins.some((pattern) => pattern.test(origin))
            ) {
                callback(null, origin);
            } else {
                callback(new Error("Origine non autorisée par CORS"));
            }
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);