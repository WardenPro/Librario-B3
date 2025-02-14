import { db } from "./database";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { argon2id } from "hash-wasm";
import crypto from "crypto";
import { logMessage } from "../utils/logger";
import { insertUserSchema } from "../../db/schema/users";

export async function createAdmin() {
    try {
        const [existingAdmin] = await db
            .select()
            .from(users)
            .where(eq(users.roles, "admin"));
        if (existingAdmin)
            return;

        const adminPassword = "adminpassword";

        const salt = new Uint8Array(16);
        crypto.getRandomValues(salt);
        const hashedPassword = await argon2id({
            password: adminPassword,
            salt,
            parallelism: 1,
            iterations: 2,
            memorySize: 19456,
            hashLength: 32,
            outputType: "encoded",
        });

        const validatedInsert = insertUserSchema.parse({
            first_name: "Admin",
            last_name: "Admin",
            password: adminPassword,
            email: "admin@example.com",
            roles: "admin",
        });

        validatedInsert.password = hashedPassword;

        await db.insert(users).values(validatedInsert).returning();

        logMessage("Default admin user created successfully");
    } catch (error) {
        console.error(error);
    }
}
