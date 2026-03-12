import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconChevronLeft, IconDots, IconRuler } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { SneakPickSelector } from "@/components/blocks/SneakPickBlock";

export const Route = createFileRoute("/sneakers/$id")({
    component: SneakerDetails,
    beforeLoad: () => checkAuth(),
});

function SneakerDetails() {
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const { isPending, data: sneaker } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
        select: items => items.find(i => i._id === id),
    });

    useEffect(() => {
        if (!isPending && !sneaker)
            navigate({ to: "/" });
    }, [isPending]);

    return (
        <div className="min-h-screen">
            <Header
                left={
                    <Button className="md:hidden" variant="outline" size="icon" onClick={() => navigate({ to: "/" })}>
                        <IconChevronLeft className="size-5" />
                    </Button>
                }
                right={
                    <>
                        <Button className="max-md:hidden" variant="outline" onClick={() => navigate({ to: "/" })}>
                            <IconChevronLeft className="size-5" data-icon="inline-start" />
                            Back to library
                        </Button>
                        <Button variant="outline" size="icon">
                            <IconDots className="size-5" />
                        </Button>
                    </>
                }
            />
            <div className="max-w-7xl mx-auto pt-4 pb-20 flex flex-col gap-8">
                <div className="px-6 md:px-8 flex flex-col gap-8">
                    <div className="w-full flex gap-5 sm:gap-6 md:gap-8">
                        {sneaker ? (
                            <>
                                <SneakerPhoto sneaker={sneaker} className="size-24 sm:size-28 md:size-32 rounded-lg ring ring-border shadow-2xl shadow-primary/25 animate-in fade-in zoom-in duration-500" />
                                <div className="flex flex-col justify-center gap-1 flex-1 animate-in fade-in duration-1000">
                                    <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{sneaker.name}</h1> 
                                    <h2 className="sm:text-xl md:text-lg lg:text-2xl text-secondary-foreground font-bold">{sneaker.color}</h2>
                                </div>
                            </>
                        ) : (
                            <>
                                <Skeleton className="size-24 sm:size-28 md:size-32 rounded-lg" />
                                <div className="flex flex-col justify-center gap-1 flex-1">
                                    <Skeleton className="w-1/3 h-10" />
                                    <Skeleton className="w-2/5 h-8" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-6">
                        {sneaker ? (
                            <div className="h-fit p-6 flex-1 bg-accent rounded-xl ring ring-border z-0">
                                <div></div>
                                <span className="flex items-center gap-1">
                                    <IconRuler className="size-4 text-secondary-foreground" />
                                    {sneaker.size}
                                </span>
                                <span className="text-foreground">•</span>
                                <span className="text-foreground">•</span>
                                {sneaker.decommissioned && (
                                    <>
                                        <span className="text-foreground">•</span>
                                        <span className="px-2.5 py-1 text-sm text-primary bg-primary/20 rounded-md">Decommissioned</span>
                                    </>
                                )}
                            </div>
                        ) : <Skeleton className="h-80 flex-1 rounded-xl" />}
                        <SneakPickSelector sneaker={sneaker} />
                    </div>
                </div>
            </div>
        </div>
    );
}