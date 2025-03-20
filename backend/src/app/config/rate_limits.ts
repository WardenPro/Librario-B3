const rateLimit = require("express-rate-limit");

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
});

export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 15,
    message: "Too many requests, please try again later.",
});