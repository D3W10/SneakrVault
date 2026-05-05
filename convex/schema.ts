import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    sneakers: defineTable({
        name: v.string(),
        color: v.optional(v.string()),
        size: v.optional(v.string()),
        brand: v.optional(v.id("brands")),
        photo: v.optional(v.id("_storage")),
        description: v.optional(v.string()),
        location: v.optional(v.union(v.id("locations"), v.literal("outside"))),
        owner: v.optional(v.id("users")),
        date: v.optional(v.string()),
        style: v.optional(v.string()),
        type: v.union(v.literal("Sneakers"), v.literal("Shoes"), v.literal("Boots"), v.literal("Flip-flops")),
        originalOwner: v.optional(v.union(v.object({
            type: v.literal("local"),
            id: v.id("users"),
        }),
        v.object({
            type: v.literal("outside"),
            name: v.string(),
        }))),
        decommissioned: v.boolean(),
        stockxUrl: v.optional(v.string()),
        goatUrl: v.optional(v.string()),
        authenticyTag: v.optional(v.string()),
        pickFor: v.optional(v.id("users")),
        pickUntil: v.optional(v.string()),
    })
        .index("by_brand", ["brand"])
        .index("by_location", ["location"])
        .index("by_pickFor", ["pickFor"]),
    brands: defineTable({
        name: v.string(),
        icon: v.optional(v.id("_storage")),
    }),
    locations: defineTable({
        name: v.string(),
    }),
    users: defineTable({
        username: v.string(),
        passwordHash: v.string(),
        role: v.union(v.literal("guest"), v.literal("member"), v.literal("admin")),
        color: v.string(),
        active: v.boolean(),
    })
        .index("by_username", ["username"]),
    loginAttempts: defineTable({
        key: v.string(),
        failedCount: v.number(),
        windowStartMs: v.number(),
        lockUntilMs: v.number(),
        updatedAtMs: v.number(),
    })
        .index("by_key", ["key"]),
    collections: defineTable({
        name: v.string(),
        cover: v.array(v.string()),
        sneakers: v.array(v.id("sneakers")),
    }),
    configs: defineTable({
        cardSecondaryInfo: v.union(v.literal("nothing"), v.literal("location"), v.literal("brand"), v.literal("size"), v.literal("owner")),
        cardShowOwnerColor: v.boolean(),
        defaultShowDecommissioned: v.boolean(),
        enableSneakPick: v.boolean(),
        homePageSections: v.array(v.string()),
        publicPage: v.boolean(),
        locationVisibility: v.union(v.literal("public"), v.literal("guests"), v.literal("protected")),
        descriptionVisibility: v.union(v.literal("public"), v.literal("guests"), v.literal("protected")),
        originalOwnerVisibility: v.union(v.literal("public"), v.literal("guests"), v.literal("protected")),
    }),
});