import { v } from "convex/values";
import { serverMutation } from "./customFunctions";

const MAX_USERNAME_LENGTH = 64;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export const guardLoginAttempt = serverMutation({
    args: {
        username: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedUsername = args.username.trim();

        if (normalizedUsername.length === 0 || normalizedUsername.length > MAX_USERNAME_LENGTH)
            return { allowed: false, retryAfterMs: LOCKOUT_DURATION_MS };

        const now = Date.now();
        const attempt = await getAttemptByKey(ctx, normalizedUsername);

        if (!attempt)
            return { allowed: true, retryAfterMs: 0 };

        if (attempt.lockUntilMs > now)
            return { allowed: false, retryAfterMs: attempt.lockUntilMs - now };

        if (attempt.windowStartMs + RATE_LIMIT_WINDOW_MS <= now && attempt.failedCount > 0) {
            await ctx.db.patch(attempt._id, {
                failedCount: 0,
                windowStartMs: now,
                lockUntilMs: 0,
                updatedAtMs: now,
            });
        }

        return { allowed: true, retryAfterMs: 0 };
    },
});

export const recordLoginResult = serverMutation({
    args: {
        username: v.string(),
        success: v.boolean(),
    },
    handler: async (ctx, args) => {
        const normalizedUsername = args.username.trim();
        if (normalizedUsername.length === 0 || normalizedUsername.length > MAX_USERNAME_LENGTH)
            return;

        const now = Date.now();
        const attempt = await getAttemptByKey(ctx, normalizedUsername);

        if (args.success) {
            if (attempt)
                await ctx.db.delete(attempt._id);

            return;
        }

        if (!attempt) {
            await ctx.db.insert("loginAttempts", {
                key: normalizedUsername,
                failedCount: 1,
                windowStartMs: now,
                lockUntilMs: 0,
                updatedAtMs: now,
            });

            return;
        }

        const isWindowExpired = attempt.windowStartMs + RATE_LIMIT_WINDOW_MS <= now;
        const failedCount = isWindowExpired ? 1 : attempt.failedCount + 1;
        const lockUntilMs = failedCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0;

        await ctx.db.patch(attempt._id, {
            failedCount,
            windowStartMs: isWindowExpired ? now : attempt.windowStartMs,
            lockUntilMs,
            updatedAtMs: now,
        });
    },
});

async function getAttemptByKey(ctx: any, key: string) {
    const attempts = await ctx.db
        .query("loginAttempts")
        .withIndex("by_key", (q: any) => q.eq("key", key))
        .collect();

    if (attempts.length > 1) {
        for (const duplicate of attempts.slice(1))
            await ctx.db.delete(duplicate._id);
    }

    return attempts[0] ?? null;
}