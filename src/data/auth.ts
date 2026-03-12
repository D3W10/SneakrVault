import { createServerFn } from "@tanstack/react-start";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "@db/api";
import type { SessionState } from "@/data/session";

const MIN_AUTH_RESPONSE_MS = 300;

export function getDashboardForUser(session: Partial<SessionState>) {
    return session.role === "admin" ? "/manage" : "/";
}

export const login = createServerFn({ method: "POST" })
    .inputValidator(z.object({ username: z.string(), password: z.string() }))
    .handler(async ({ data }) => {
        let client: ConvexHttpClient | null = null;
        const startedAt = Date.now();

        try {
            client = getClient();

            const guard = await client.mutation(api.auth.guardLoginAttempt, { username: data.username, ...await generateAuthPayload(false) });
            if (!guard.allowed) {
                await waitForMinimumDuration(startedAt);
                return { success: false, error: "Too many attempts. Try again later" };
            }

            const user = await client.query(api.users.getByUsername, { username: data.username, ...await generateAuthPayload(false) });
            if (!user)
                return { success: false, error: "Invalid credentials" };

            const isMatch = await verifyScryptHash(data.password, user.passwordHash);
            await client.mutation(api.auth.recordLoginResult, { username: data.username, success: isMatch, ...await generateAuthPayload(false) });
            await waitForMinimumDuration(startedAt);

            if (isMatch) {
                const session = await getAppSession();
                await session.update({
                    isAuthenticated: true,
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                } satisfies SessionState);

                return { success: true };
            }
        } catch (error) {
            if (client) {
                try {
                    await client.mutation(api.auth.recordLoginResult, { username: data.username, success: false, ...await generateAuthPayload(false) });
                } catch (recordError) {
                    console.error("Failed to record login result:", recordError);
                }
            }

            console.error("Authentication error:", error);
            await waitForMinimumDuration(startedAt);
        }

        return { success: false, error: "Invalid credentials" };
    });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
    const session = await getAppSession();
    await session.clear();
});

export const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
    return (await getAppSession()).data;
});

export const getConvexQueryAuthPayload = createServerFn({ method: "GET" }).handler(async () => {
    return await generateAuthPayload();
});

export function getClient() {
    const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;
    if (!url)
        throw new Error("Missing Convex URL. Set CONVEX_URL or VITE_CONVEX_URL to your Convex deployment URL.");

    return new ConvexHttpClient(url, { logger: false });
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForMinimumDuration(startedAt: number) {
    const elapsed = Date.now() - startedAt;

    if (elapsed < MIN_AUTH_RESPONSE_MS)
        await wait(MIN_AUTH_RESPONSE_MS - elapsed);
}

export async function generateAuthPayload(requireAuth = true) {
    const session = await getAppSession();
    if (requireAuth && !session.data.isAuthenticated)
        throw new Error("Unauthorized");

    const authRole = session.data.isAuthenticated ? (session.data.role ?? "guest") : "guest";

    const timestamp = Date.now();
    const secret = process.env.CONVEX_SERVER_SECRET!;

    const data = new TextEncoder().encode(`${secret}:${timestamp}:${authRole}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const signature = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return { signature, timestamp, authRole };
}

function parseScryptHash(encodedHash: string) {
    const parts = encodedHash.split("$");

    if (parts.length !== 3 || parts[0] !== "scrypt")
        return null;

    try {
        const salt = Buffer.from(parts[1], "base64");
        const hash = Buffer.from(parts[2], "base64");

        if (salt.length === 0 || hash.length === 0)
            return null;

        return { salt, hash };
    } catch {
        return null;
    }
}

async function getCryptoHelpers() {
    const [{ timingSafeEqual, scrypt: scryptCallback }, { promisify }] = await Promise.all([
        import("node:crypto"),
        import("node:util"),
    ]);

    return {
        timingSafeEqual,
        scrypt: promisify(scryptCallback),
    };
}

async function getAppSession() {
    return (await import("./session")).useAppSession();
}

async function verifyScryptHash(password: string, encodedHash: string) {
    const { scrypt, timingSafeEqual } = await getCryptoHelpers();
    const parsed = parseScryptHash(encodedHash);
    if (!parsed)
        return false;

    const derived = await scrypt(password, parsed.salt, parsed.hash.length) as Buffer;
    if (derived.length !== parsed.hash.length)
        return false;

    return timingSafeEqual(derived, parsed.hash);
}