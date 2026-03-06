import { query } from "@db/server";

export const get = query({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("brands").collect();
    },
});