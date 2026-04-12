import { createRootRouteWithContext, HeadContent, Link, redirect, Scripts, useLocation } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { TanStackQueryProvider } from "@/integrations/query";
import { checkAuth } from "@/data/auth";
import { cn } from "@/lib/utils";
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
    const location = useLocation();

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <TanStackQueryProvider>
                    {children}
                    {["/", "/collections"].includes(location.pathname) &&
                        <div className="flex justify-center sticky bottom-6 left-0 right-0 z-50">
                            <div className="w-fit p-1.25 flex bg-secondary rounded-full ring ring-border/75">
                                <Link to="/" className={cn("py-1 pl-2.5 pr-3 flex items-center gap-2 hover:bg-muted/50 rounded-full transition-colors", location.pathname === "/" && "text-primary")}>
                                    <IconLayoutGrid className="size-5" />
                                    <span className="font-semibold">Library</span>
                                </Link>
                                <Link to="/collections" className={cn("py-1 pl-2.5 pr-3 flex items-center gap-2 hover:bg-muted/50 rounded-full transition-colors", location.pathname === "/collections" && "text-primary")}>
                                    <IconLayoutList className="size-5" />
                                    <span className="font-semibold">Collections</span>
                                </Link>
                            </div>
                        </div>
                    }
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