import { createServerFn } from "@tanstack/react-start";
import { generateAuthPayload, getClient } from "@/data/auth";
import { api } from "@db/api";
import type { Doc, Id } from "@db/dataModel";

type Db<T extends object> = Omit<T, "_id" | "_creationTime">;

async function encryptPassword(password: string) {
    const { randomBytes, scryptSync } = await import("node:crypto");

    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function handleQuery<T>(queryFn: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
        return await queryFn();
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : errorMessage);
    }
}

async function handleMutation(mutationFn: () => Promise<any>, errorMessage: string) {
    try {
        await mutationFn();
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : errorMessage };
    }
}

export const getUsers = createServerFn({ method: "GET" })
    .handler(() => handleQuery(
        async () => getClient().query(api.users.get, await generateAuthPayload()),
        "Failed to get users"
    ));

export const getOwners = createServerFn({ method: "GET" })
    .handler(() => handleQuery(
        async () => getClient().query(api.users.getOwners, await generateAuthPayload()),
        "Failed to get owners"
    ));

export const addUser = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"users">>, "passwordHash"> & { password: string }) => data)
    .handler(async ({ data }) => {
        const username = data.username.trim();
        const password = data.password;
        const color = data.color.trim();
        if (!username || !password || !color)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.users.insert, {
                username,
                passwordHash: await encryptPassword(password),
                color,
                role: data.role,
                active: data.active,
                ...(await generateAuthPayload()),
            }),
            "Failed to add user"
        );
    });

export const editUser = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"users">>, "passwordHash"> & { _id: Id<"users">; password?: string }) => data)
    .handler(async ({ data }) => {
        const username = data.username.trim();
        const color = data.color.trim();
        const password = (data.password ?? "").trim();
        const passwordHash = password ? await encryptPassword(password) : undefined;
        if (!data._id || !username || !color)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.users.update, {
                _id: data._id,
                username,
                passwordHash,
                color,
                role: data.role,
                active: data.active,
                ...(await generateAuthPayload()),
            }),
            "Failed to edit user"
        );
    });

export const deleteUser = createServerFn({ method: "POST" })
    .inputValidator((data: { _id: Id<"users"> }) => data)
    .handler(async ({ data }) => {
        if (!data._id)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.users.remove, {
                _id: data._id,
                ...(await generateAuthPayload()),
            }),
            "Failed to delete user"
        );
    });

export const getSneakers = createServerFn({ method: "GET" })
    .handler(() => handleQuery(
        async () => getClient().query(api.sneakers.get, await generateAuthPayload()),
        "Failed to get sneakers"
    ));

export const getBrands = createServerFn({ method: "GET" })
    .handler(() => handleQuery(
        async () => getClient().query(api.brands.get, await generateAuthPayload()),
        "Failed to get brands"
    ));

export const addBrand = createServerFn({ method: "POST" })
    .inputValidator((data: Db<Doc<"brands">>) => data)
    .handler(async ({ data }) => {
        const name = data.name.trim();
        const slug = data.slug.trim();
        if (!name || !slug)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.brands.insert, {
                name,
                slug,
                ...(await generateAuthPayload()),
            }),
            "Failed to add brand"
        );
    });

export const editBrand = createServerFn({ method: "POST" })
    .inputValidator((data: Db<Doc<"brands">> & { _id: Id<"brands"> }) => data)
    .handler(async ({ data }) => {
        const name = data.name.trim();
        const slug = data.slug.trim();
        if (!data._id || !name || !slug)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.brands.update, {
                _id: data._id,
                name,
                slug,
                ...(await generateAuthPayload()),
            }),
            "Failed to edit brand"
        );
    });

export const deleteBrand = createServerFn({ method: "POST" })
    .inputValidator((data: { _id: Id<"brands"> }) => data)
    .handler(async ({ data }) => {
        if (!data._id)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.brands.remove, {
                _id: data._id,
                ...(await generateAuthPayload()),
            }),
            "Failed to delete brand"
        );
    });

export const getLocations = createServerFn({ method: "GET" })
    .handler(() => handleQuery(
        async () => getClient().query(api.locations.get, await generateAuthPayload()),
        "Failed to get locations"
    ));

export const addLocation = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"locations">>, "passwordHash">) => data)
    .handler(async ({ data }) => {
        const name = data.name.trim();
        if (!name)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.locations.insert, {
                name,
                ...(await generateAuthPayload()),
            }),
            "Failed to add location"
        );
    });

export const editLocation = createServerFn({ method: "POST" })
    .inputValidator((data: Omit<Db<Doc<"locations">>, "passwordHash"> & { _id: Id<"locations"> }) => data)
    .handler(async ({ data }) => {
        const name = data.name.trim();
        if (!data._id || !name)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.locations.update, {
                _id: data._id,
                name,
                ...(await generateAuthPayload()),
            }),
            "Failed to edit location"
        );
    });

export const deleteLocation = createServerFn({ method: "POST" })
    .inputValidator((data: { _id: Id<"locations"> }) => data)
    .handler(async ({ data }) => {
        if (!data._id)
            return { success: false, error: "Missing required fields" };

        return handleMutation(
            async () => getClient().mutation(api.locations.remove, {
                _id: data._id,
                ...(await generateAuthPayload()),
            }),
            "Failed to delete location"
        );
    });