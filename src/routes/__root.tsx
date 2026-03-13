import { createRootRouteWithContext, HeadContent, redirect, Scripts } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackQueryProvider } from "@/integrations/query";
import { checkAuth } from "@/data/auth";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: async ({ location }) => {
        const auth = await checkAuth();
        const redirectPath = auth.role === "admin" ? "/manage" : "/";

        if (location.pathname === "/login") {
            if (auth.isAuthenticated)
                throw redirect({ to: redirectPath });

            return {};
        }

        if (!auth.isAuthenticated)
            throw redirect({ to: "/login" });

        if (auth.role === "admin" && !location.pathname.startsWith("/manage"))
            throw redirect({ to: "/manage" });

        if (auth.role !== "admin" && location.pathname.startsWith("/manage"))
            throw redirect({ to: "/" });

        return { auth };
    },
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "SneakrVault",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
            {
                rel: "apple-touch-icon",
                href: "/logo192.png",
            },
            {
                rel: "manifest",
                href: "/manifest.json",
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <TanStackQueryProvider>
                    {children}
                </TanStackQueryProvider>
                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        {
                            name: "Tanstack Query",
                            render: <ReactQueryDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    )
}