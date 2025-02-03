import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import "./middlewares/key";
import cors from "cors";
import dotenv from "dotenv";

export const app = express();
dotenv.config();
export let NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
    throw new Error("NODE_ENV is not defined in environment variables.");
}

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);
