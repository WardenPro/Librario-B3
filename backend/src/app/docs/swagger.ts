import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API Documentation with Swagger",
        },
        servers: [{ url: "http://localhost:3000" }],
        tags: [
            
        ],
    },
    apis: ["./src/routes/*.ts"],
});
