import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    sneakers: defineTable({
        name: v.string(),
        color: v.string(),
        size: v.number(),
        brand: v.id("brands"),
        photo: v.optional(v.id("_storage")),
        location: v.union(v.id("locations"), v.literal("outside")),
        owner: v.optional(v.id("users")),
        date: v.optional(v.string()),
        originalOwner: v.optional(v.id("users")),
        decommissioned: v.boolean(),
        stockxUrl: v.optional(v.string()),
        pickDate: v.optional(v.string()),
        pickTo: v.optional(v.id("users")),
    })
        .index("by_brand", ["brand"])
        .index("by_location", ["location"]),
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
        role: v.union(v.literal("guest"), v.literal("normal"), v.literal("admin")),
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
});