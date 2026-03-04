import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
    const convexQueryClient = new ConvexQueryClient((import.meta as any).env.VITE_CONVEX_URL!);
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryKeyHashFn: convexQueryClient.hashFn(),
                queryFn: convexQueryClient.queryFn(),
            },
        },
    });
    convexQueryClient.connect(queryClient);

    const router = routerWithQueryClient(
        createRouter({
            routeTree,
            defaultPreload: "intent",
            context: { queryClient },
            scrollRestoration: true,
            Wrap: ({ children }) => (
                <ConvexProvider client={convexQueryClient.convexClient}>
                    {children}
                </ConvexProvider>
            ),
        }),
        queryClient,
    );

    return router;
}