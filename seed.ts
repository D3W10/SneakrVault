import { randomBytes, scryptSync } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@db/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export function encryptPassword(password: string) {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function seed() {
    await client.mutation(api.users.insert, {
        username: process.env.DEFAULT_ADMIN_USER!,
        passwordHash: encryptPassword(process.env.DEFAULT_ADMIN_PASSWORD!),
        color: "",
        role: "admin",
        active: true,
    });

    console.log("Database seeded successfully!");
}

seed();