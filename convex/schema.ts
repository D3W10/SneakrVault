import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        passwordHash: v.string(),
        color: v.string(),
        active: v.boolean(),
    })
        .index("by_username", ["username"]),
    sneakers: defineTable({
        name: v.string(),
        color: v.string(),
        size: v.number(),
        date: v.string(),
        slug: v.string(),
        brand: v.id("brands"),
        location: v.union(v.id("locations"), v.literal("outside")),
        owner: v.optional(v.id("users")),
        originalOwner: v.optional(v.id("users")),
        decommissioned: v.boolean(),
        pickDate: v.optional(v.string()),
        pickTo: v.optional(v.id("users")),
        stockxUrl: v.optional(v.string()),
    })
        .index("by_brand", ["brand"])
        .index("by_location", ["location"]),
    brands: defineTable({
        name: v.string(),
        slug: v.string(),
    }),
    locations: defineTable({
        name: v.string(),
    }),
    loginAttempts: defineTable({
        key: v.string(),
        failedCount: v.number(),
        windowStartMs: v.number(),
        lockUntilMs: v.number(),
        updatedAtMs: v.number(),
    })
        .index("by_key", ["key"]),
});