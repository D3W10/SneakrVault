import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { guestQuery, normalMutation } from "./customFunctions";

export const SneakerInsert = z.object({
    name: z.string(),
    color: z.string(),
    size: z.number(),
    date: z.string(),
    slug: z.string(),
    brand: zid("brands"),
    location: z.union([zid("locations"), z.literal("outside")]),
    owner: zid("users").optional(),
    originalOwner: zid("users").optional(),
    decommissioned: z.boolean(),
    pickDate: z.string().optional(),
    pickTo: zid("users").optional(),
    stockxUrl: z.string().optional(),
});
export const SneakerUpdate = SneakerInsert.partial().extend({ _id: zid("sneakers") });
export const SneakerRemove = z.object({ _id: zid("sneakers") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const sneakers = await ctx.db.query("sneakers").collect();

        return Promise.all(
            sneakers.map(async sneaker => {
                const brand = await ctx.db.get(sneaker.brand);
                
                let locationId = "";
                let locationName = "Outside";
                if (sneaker.location !== "outside") {
                    const location = await ctx.db.get(sneaker.location);
                    locationId = location?._id ?? "";
                    locationName = location?.name ?? "Unknown";
                }

                return {
                    ...sneaker,
                    brand: {
                        _id: brand?._id,
                        name: brand?.name ?? "Unknown",
                    },
                    location: {
                        _id: locationId,
                        name: locationName,
                    },
                };
            })
        );
    },
});

export const insert = normalMutation({
    args: SneakerInsert,
    handler: async (ctx, args) => {
        await ctx.db.insert("sneakers", args);
        return { success: true };
    },
});

export const update = normalMutation({
    args: SneakerUpdate,
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(args._id, rest);
        return { success: true };
    },
});

export const remove = normalMutation({
    args: { _id: zid("sneakers") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
        return { success: true };
    },
});