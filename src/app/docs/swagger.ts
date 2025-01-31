import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "Documentation API avec Swagger",
        },
        servers: [{ url: "http://localhost:3000" }],
        tags: [
            { name: "Machines", description: "Endpoints liés aux machines" },
            {
                name: "Connecteurs",
                description: "Endpoints liés aux connecteurs",
            },
            {
                name: "Machines-Connecteurs",
                description: "Endpoints pour relations",
            },
            {
                name: "Utilisateurs",
                description: "Endpoints pour utilisateurs",
            },
        ],
    },
    apis: ["./src/**/*.ts"],
});