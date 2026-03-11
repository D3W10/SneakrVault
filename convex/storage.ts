import { normalMutation } from "./customFunctions";

export const generateUploadUrl = normalMutation({
    args: {},
    handler: async ctx => {
        return await ctx.storage.generateUploadUrl();
    },
});