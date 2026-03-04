import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "./session";

async function waitForMinimumDuration(startedAt: number) {
    const elapsed = Date.now() - startedAt;

    if (elapsed < MIN_AUTH_RESPONSE_MS)
        await wait(MIN_AUTH_RESPONSE_MS - elapsed);
}

function getConvexUrl() {
    const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;

    if (!url)
        throw new Error("Missing Convex URL. Set CONVEX_URL or VITE_CONVEX_URL to your Convex deployment URL.");

    return url;
}

function getConvexAdminKey() {
    const key = process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_DEPLOY_KEY;

    if (!key)
        throw new Error("Missing CONVEX_ADMIN_KEY. Set CONVEX_ADMIN_KEY (or CONVEX_DEPLOY_KEY) for internal auth functions.");

    return key;
}

function createInternalConvexClient() {
    const client = new ConvexHttpClient(getConvexUrl(), { logger: false });
    const internalClient = client as ConvexInternalClient;

    internalClient.setDebug?.(false);

    if (!internalClient.setAdminAuth)
        throw new Error("This Convex client version does not expose admin auth.");

    internalClient.setAdminAuth(getConvexAdminKey());

    return client;
}

export const login = createServerFn({ method: "POST" })
    .inputValidator((data: { username: string; password: string }) => data)
    .handler(async ({ data }) => {
        const startedAt = Date.now();
        const username = data.username.trim();
        const password = data.password;

        if (username.length === 0 || password.length === 0)
            return { success: false, error: "Invalid credentials" };

    });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
    const session = await useAppSession();
    await session.clear();
});

export const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
    return getAuthPayload();
});