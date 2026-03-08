import { v } from "convex/values";
import { guestQuery, normalMutation } from "./customFunctions";

export const get = guestQuery({
    args: {},
    handler: async ctx => {
        const sneakers = await ctx.db.query("sneakers").collect();

        return Promise.all(
            sneakers.map(async sneaker => {
                const brand = await ctx.db.get(sneaker.brand);
                
                let locationName = "Outside";
                if (sneaker.location !== "outside") {
                    const location = await ctx.db.get(sneaker.location);
                    locationName = location?.name ?? "Unknown";
                }

                return {
                    ...sneaker,
                    brand: {
                        name: brand?.name ?? "Unknown",
                        slug: brand?.slug ?? "unknown",
                    },
                    location: locationName,
                };
            })
        );
    },
});