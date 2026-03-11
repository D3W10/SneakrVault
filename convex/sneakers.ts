import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { guestQuery, normalMutation } from "./customFunctions";

export const SneakerInsert = z.object({
    name: z.string(),
    color: z.string(),
    size: z.number(),
    brand: zid("brands"),
    photo: zid("_storage").optional(),
    location: z.union([zid("locations"), z.literal("outside")]),
    owner: zid("users").optional(),
    date: z.string().optional(),
    originalOwner: zid("users").optional(),
    decommissioned: z.boolean(),
    stockxUrl: z.string().optional(),
    pickDate: z.string().optional(),
    pickTo: zid("users").optional(),
});
export const SneakerUpdate = SneakerInsert.partial().extend({ _id: zid("sneakers"), photo: zid("_storage").nullish() });
export const SneakerRemove = z.object({ _id: zid("sneakers") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const sneakers = await ctx.db.query("sneakers").collect();

        return Promise.all(
            sneakers.map(async sneaker => {
                const brand = await ctx.db.get(sneaker.brand);
                
                let locationId = "outside";
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
                    photoUrl: sneaker.photo && await ctx.storage.getUrl(sneaker.photo)
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
        const { _id, photo, ...rest } = args;
        const sneaker = await ctx.db.query("sneakers").filter(q => q.eq(q.field("_id"), _id)).first();

        let patch = { ...rest } as z.infer<typeof SneakerInsert>;

        if (photo !== undefined) {
            patch.photo = photo === null ? undefined : photo;
            if (sneaker?.photo)
                await ctx.storage.delete(sneaker.photo);
        }

        await ctx.db.patch(args._id, patch);
        return { success: true };
    },
});

export const remove = normalMutation({
    args: { _id: zid("sneakers") },
    handler: async (ctx, args) => {
        const sneaker = await ctx.db.query("sneakers").filter(q => q.eq(q.field("_id"), args._id)).first();
        if (sneaker?.photo)
            await ctx.storage.delete(sneaker.photo);

        await ctx.db.delete(args._id);
        return { success: true };
    },
});