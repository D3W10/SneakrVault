import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import { guestQuery, normalMutation } from "./customFunctions";
import type { Doc } from "@db/dataModel";
import type { QueryCtx } from "@db/server";

export const SneakerInsert = z.object({
    name: z.string(),
    color: z.string(),
    size: z.number(),
    brand: zid("brands"),
    photo: zid("_storage").optional(),
    location: z.union([zid("locations"), z.literal("outside")]),
    owner: zid("users").optional(),
    date: z.string().optional(),
    type: z.union([z.literal("Sneakers"), z.literal("Shoes"), z.literal("Boots"), z.literal("Flip-flops")]),
    originalOwner: z.union([
        z.object({
            type: z.literal("local"),
            id: zid("users"),
        }),
        z.object({
            type: z.literal("outside"),
            name: z.string(),
        })
    ]).optional(),
    decommissioned: z.boolean(),
    stockxUrl: z.string().optional(),
    pickFor: zid("users").optional(),
    pickUntil: z.string().optional(),
});
export const SneakerUpdate = SneakerInsert.partial().extend({ _id: zid("sneakers"), photo: zid("_storage").nullish() });
export const SneakerRemove = z.object({ _id: zid("sneakers") });

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const sneakers = await ctx.db.query("sneakers").collect();

        return Promise.all(sneakers.map(s => transformSneaker(ctx, s)));
    },
});

export const getPickedSneakers = guestQuery({
    args: {},
    handler: async ctx => {
        const now = new Date().toISOString();
        const sneakers = await ctx.db
            .query("sneakers")
            .filter(q =>
                q.and(
                    q.neq(q.field("pickFor"), undefined),
                    q.neq(q.field("pickUntil"), undefined),
                    q.lt(now, q.field("pickUntil")),
                ),
            )
            .collect();

        return Promise.all(sneakers.map(s => transformSneaker(ctx, s)));
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

async function transformSneaker(ctx: QueryCtx, sneaker: Doc<"sneakers">) {
    const brand = await ctx.db.get(sneaker.brand);

    let location = { _id: "outside", name: "Outside" };
    if (sneaker.location !== "outside") {
        const doc = await ctx.db.get(sneaker.location);
        location = { _id: doc?._id ?? "", name: doc?.name ?? "Unknown" };
    }

    let owner = { _id: "", username: "", color: "" };
    if (sneaker.owner) {
        const doc = await ctx.db.get(sneaker.owner);
        owner = { _id: doc?._id ?? "", username: doc?.username ?? "", color: doc?.color ?? "" };
    }

    let originalOwner = { _id: "", type: "", username: "", color: "" };
    if (sneaker.originalOwner) {
        if (sneaker.originalOwner.type === "local") {
            const doc = await ctx.db.get(sneaker.originalOwner.id);
            originalOwner = { _id: doc?._id ?? "", type: "local", username: doc?.username ?? "", color: doc?.color ?? "" };
        } else
            originalOwner = { _id: "", type: "outside", username: sneaker.originalOwner.name, color: "" };
    }

    let pickFor = { _id: "", username: "", color: "" };
    if (sneaker.pickFor) {
        const doc = await ctx.db.get(sneaker.pickFor);
        pickFor = { _id: doc?._id ?? "", username: doc?.username ?? "", color: doc?.color ?? "" };
    }

    return {
        ...sneaker,
        brand: {
            _id: brand?._id,
            name: brand?.name ?? "Unknown",
            iconUrl: brand?.icon && await ctx.storage.getUrl(brand.icon)
        },
        photoUrl: sneaker.photo && await ctx.storage.getUrl(sneaker.photo),
        location,
        owner,
        originalOwner,
        pickFor
    };
}