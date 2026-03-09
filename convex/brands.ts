import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { adminMutation, guestQuery } from "./customFunctions";

export const BrandInsert = z.object({
    name: z.string(),
    icon: zid("_storage"),
});
export const BrandUpdate = BrandInsert.partial().extend({ _id: zid("brands") });
export const BrandRemove = z.object({ _id: zid("brands") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const brands = await ctx.db.query("brands").collect();

        return Promise.all(brands.map(async b => ({ ...b, iconUrl: await ctx.storage.getUrl(b.icon) })));
    },
});

export const generateUploadUrl = adminMutation({
    args: {},
    handler: async ctx => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const insert = adminMutation({
    args: BrandInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("brands", args);
        return { success: true };
    },
});

export const update = adminMutation({
    args: BrandUpdate,
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        const brand = await ctx.db.query("brands").filter(q => q.eq(q.field("_id"), _id)).first();

        if (args.icon && brand?.icon)
            await ctx.storage.delete(brand.icon);

        await ctx.db.patch(args._id, rest);
        return { success: true };
    },
});

export const remove = adminMutation({
    args: BrandRemove,
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});