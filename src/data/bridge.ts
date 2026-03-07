import { createServerFn } from "@tanstack/react-start";
import { generateAuthPayload, getClient } from "@/data/auth";
import { api } from "@db/api";
import type { Doc } from "@db/dataModel";

type Db<T extends object> = Omit<T, "_id" | "_creationTime">;

async function encryptPassword(password: string) {
    const { randomBytes, scryptSync } = await import("node:crypto");

    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export const getSneakers = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            return await getClient().query(api.sneakers.get, await generateAuthPayload());
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get sneakers");
        }
    });

export const getBrands = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            return await getClient().query(api.brands.get, await generateAuthPayload());
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get brands");
        }
    });

export const getLocations = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            return await getClient().query(api.locations.get, await generateAuthPayload());
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get locations");
        }
    });

export const getUsers = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            return await getClient().query(api.users.get, await generateAuthPayload());
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get users");
        }
    });

export const getOwners = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            return await getClient().query(api.users.getOwners, await generateAuthPayload());
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get owners");
        }
    });

export const addUser = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"users">>, "passwordHash"> & { password: string }) => data)
    .handler(async ({ data }) => {
        const username = data.username.trim();
        const password = data.password;
        const color = data.color.trim();

        if (!username || !password || !color)
            return { success: false, error: "Missing required fields" };

        try {
            const client = getClient();

            await client.mutation(api.users.insert, {
                username,
                passwordHash: await encryptPassword(password),
                color,
                role: data.role,
                active: data.active,
                ...await generateAuthPayload(),
            });

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add user";
            return { success: false, error: message };
        }
    });

export const editUser = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"users">>, "passwordHash"> & { oldUsername: string; password?: string }) => data)
    .handler(async ({ data }) => {
        const oldUsername = data.oldUsername.trim();
        const username = data.username.trim();
        const color = data.color.trim();
        const password = (data.password ?? "").trim();
        const passwordHash = password ? await encryptPassword(password) : undefined;

        if (!oldUsername || !username || !color)
            return { success: false, error: "Missing required fields" };

        try {
            const client = getClient();

            await client.mutation(api.users.update, {
                oldUsername,
                username,
                passwordHash,
                color,
                role: data.role,
                active: data.active,
                ...await generateAuthPayload(),
            });

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to edit user";
            return { success: false, error: message };
        }
    });

export const deleteUser = createServerFn({ method: "POST" })
    .inputValidator((data: { username: string }) => data)
    .handler(async ({ data }) => {
        const username = data.username.trim();

        if (!username)
            return { success: false, error: "Missing required fields" };

        try {
            const client = getClient();

            await client.mutation(api.users.remove, {
                username,
                ...await generateAuthPayload(),
            });

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete user";
            return { success: false, error: message };
        }
    });
