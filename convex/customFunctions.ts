import { v } from "convex/values";
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { mutation, query } from "@db/server";
import type { Doc } from "@db/dataModel";

type AuthRole = Doc<"users">["role"];

const AUTH_ARGS = {
    signature: v.string(),
    timestamp: v.number(),
    authRole: v.union(v.literal("guest"), v.literal("normal"), v.literal("admin")),
};
const ROLE_PRIORITY: Record<AuthRole, number> = {
    guest: 0,
    normal: 1,
    admin: 2,
};

async function validateAuthInput(args: { signature: string; timestamp: number; authRole: AuthRole }, minimumRole: AuthRole) {
    const now = Date.now();
    if (Math.abs(now - args.timestamp) > 60_000)
        throw new Error("Unauthorized: Request expired");

    const encoder = new TextEncoder();
    const data = encoder.encode(`${process.env.CONVEX_SERVER_SECRET}:${args.timestamp}:${args.authRole}`);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const expectedSignature = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    if (args.signature !== expectedSignature)
        throw new Error("Unauthorized: Invalid signature");

    if (ROLE_PRIORITY[args.authRole] < ROLE_PRIORITY[minimumRole])
        throw new Error("Forbidden: Insufficient role");
}

export const guestQuery = customQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "guest");
        return { ctx, args: {} };
    },
});

export const normalQuery = customQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "normal");
        return { ctx, args: {} };
    },
});

export const adminQuery = customQuery(query, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "admin");
        return { ctx, args: {} };
    },
});

export const guestMutation = customMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "guest");
        return { ctx, args: {} };
    },
});

export const normalMutation = customMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "normal");
        return { ctx, args: {} };
    },
});

export const adminMutation = customMutation(mutation, {
    args: AUTH_ARGS,
    input: async (ctx, args) => {
        await validateAuthInput(args, "admin");
        return { ctx, args: {} };
    },
});