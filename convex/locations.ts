import { v } from "convex/values";
import { adminMutation, guestQuery } from "./customFunctions";

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("locations").collect();
    },
});

export const insert = adminMutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("locations", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: {
        _id: v.id("locations"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(args._id, rest);
        return { success: true };
    },
});

export const remove = adminMutation({
    args: {
        _id: v.id("locations"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});