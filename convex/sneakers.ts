import { v } from "convex/values";
import { guestQuery, normalMutation } from "./customFunctions";

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("sneakers").collect();
    },
});