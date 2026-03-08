import { v } from "convex/values";
import { adminMutation, adminQuery, guestQuery } from "./customFunctions";

export const get = adminQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("users").collect();
    },
});

export const getOwners = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("users").filter(q => q.eq(q.field("role"), "normal")).collect();
    },
});

export const getByUsername = guestQuery({
    args: {
        username: v.string(),
    },
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
    args: {
        username: v.string(),
        passwordHash: v.string(),
        role: v.union(v.literal("guest"), v.literal("normal"), v.literal("admin")),
        color: v.string(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: {
        _id: v.id("users"),
        username: v.string(),
        passwordHash: v.optional(v.string()),
        role: v.union(v.literal("guest"), v.literal("normal"), v.literal("admin")),
        color: v.string(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args._id, {
            username: args.username,
            role: args.role,
            color: args.color,
            active: args.active,
            ...(args.passwordHash ? { passwordHash: args.passwordHash } : {}),
        });

        return { success: true };
    },
});

export const remove = adminMutation({
    args: {
        _id: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});