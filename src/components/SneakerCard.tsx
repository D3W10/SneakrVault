import { Link } from "@tanstack/react-router";
import moment from "moment";
import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton"
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { cn } from "@/lib/utils";
import type { Sneaker } from "@/lib/models";

interface SneakerCardProps {
    sneaker: Sneaker;
    birthday?: boolean;
}

export function SneakerCard({ sneaker, birthday }: SneakerCardProps) {
    return (
        <Link to="/sneakers/$id" params={{ id: sneaker._id }} className={cn("block relative p-2 pr-4 bg-secondary rounded-2xl hover:shadow-2xl hover:shadow-primary/5 group ring ring-border/75 hover:border-white/20 overflow-hidden transition-shadow duration-300", !birthday ? "w-full" : "shrink-0")}>
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-full flex items-center gap-4 relative z-1">
                <SneakerPhoto sneaker={sneaker} />
                <div className="min-w-0 flex flex-col justify-center gap-y-2">
                    <div>
                        <h3 className="text-xl text-white group-hover:text-primary-200 font-bold tracking-tight truncate transition-colors">{sneaker.name}</h3>
                        <h3 className="text-md text-zinc-300 group-hover:text-primary-100 font-medium transition-colors">{sneaker.color}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {!birthday ? (
                            <>
                                <IconMapPin className="size-4 shrink-0 text-primary" />
                                <span className="text-primary-100 group-hover:text-primary-300 opacity-75 group-hover:opacity-100 font-semibold truncate transition">
                                    {sneaker.location}
                                </span>
                            </>
                            
                        ) : (
                            <>
                                <IconCalendarEvent className="size-4 shrink-0 text-primary" />
                                <span className="text-primary-100 group-hover:text-primary-300 opacity-75 group-hover:opacity-100 font-semibold truncate transition">
                                    {moment(sneaker.date).format("MM-DD") === moment().format("MM-DD") ? "Today" : moment(sneaker.date).format("D MMM")}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function SneakerCardSkeleton() {
    return (
        <div className="w-full p-2 flex items-center gap-4 bg-secondary rounded-2xl ring ring-border">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-center flex-1 gap-y-3">
                <div className="space-y-1.5">
                    <Skeleton className="w-1/2 h-5" />
                    <Skeleton className="w-1/3 h-4.5" />
                </div>
                <div className="flex items-center gap-1.5">
                    <IconMapPin className="size-4 shrink-0 text-muted animate-pulse" />
                    <Skeleton className="w-1/5 h-4" />
                </div>
            </div>
        </div>
    )
}