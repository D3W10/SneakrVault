import { guestQuery } from "./customFunctions";

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("locations").collect();
    },
});