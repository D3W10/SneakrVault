import { z } from "zod";
import { query } from "@db/server";
import { adminMutation } from "./customFunctions";

export const ConfigUpdate = z.object({
    publicPage: z.boolean(),
    showOwnerOnCard: z.boolean(),
    showLocationOnCard: z.boolean(),
    enableSneakPick: z.boolean(),
    homePageSections: z.array(z.string()),
});

export const get = query({
    args: {},
    handler: async ctx => {
        return await ctx.db.query("configs").first();
    },
});

export const update = adminMutation({
    args: ConfigUpdate,
    handler: async (ctx, args) => {
        const config = await ctx.db.query("configs").first();
        if (!config)
            await ctx.db.insert("configs", args);
        else
            await ctx.db.patch(config._id, args);

        return { success: true };
    },
});
