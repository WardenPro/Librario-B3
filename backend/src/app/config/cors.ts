import cors from "cors";

export const corsOptions: cors.CorsOptions = {
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