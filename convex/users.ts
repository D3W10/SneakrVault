import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { adminMutation, adminQuery, guestQuery } from "./customFunctions";

export const UserInsert = z.object({
    username: z.string(),
    passwordHash: z.string(),
    role: z.union([z.literal("guest"), z.literal("member"), z.literal("admin")]),
    color: z.string(),
    active: z.boolean(),
});
export const UserUpdate = UserInsert.partial().extend({ _id: zid("users") });
export const UserRemove = z.object({ _id: zid("users") });

export const get = adminQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("users").collect();
    },
});

export const getOwners = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("users").filter(q => q.eq(q.field("role"), "member") || q.eq(q.field("role"), "admin")).collect();
    },
});

export const getByUsername = guestQuery({
    args: { username: z.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter(q =>
                q.and(
                    q.eq(q.field("username"), args.username),
                    q.eq(q.field("active"), true),
                ),
            )
            .first();
    },
});

export const insert = adminMutation({
    args: UserInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("users", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: UserUpdate,
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(args._id, rest);
        return { success: true };
    },
});

export const remove = adminMutation({
    args: { _id: zid("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});