import { createRouter } from "@tanstack/react-router";
import { getContext } from "@/integrations/query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
    const router = createRouter({
        routeTree,
        context: getContext(),
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
    });

    return router;
}