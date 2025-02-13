import { db } from "../../app/config/database";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { argon2id } from "hash-wasm";
import crypto from "crypto";

export async function createAdmin() {
    try {
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.email, "admin@example.com"))
            .execute();

        if (existingAdmin.length === 0) {
            const salt = new Uint8Array(16);
            crypto.getRandomValues(salt);
            const hashedPassword = await argon2id({
                password: "adminpassword",
                salt,
                parallelism: 1,
                iterations: 2,
                memorySize: 19456,
                hashLength: 32,
                outputType: "encoded",
            });

            await db
                .insert(users)
                .values({
                    last_name: "Admin",
                    first_name: "Admin",
                    password: hashedPassword,
                    email: "admin@example.com",
                    roles: "admin",
                    created_at: new Date(),
                })
                .execute();

            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error(error);
    }
}
