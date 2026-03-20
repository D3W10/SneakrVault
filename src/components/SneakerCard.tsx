import { Link } from "@tanstack/react-router";
import { IconCake, IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton"
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { cn } from "@/lib/utils";
import type { Sneaker } from "@/lib/models";

interface SneakerCardProps {
    sneaker: Sneaker;
    birthday?: boolean;
}

export function SneakerCard({ sneaker, birthday }: SneakerCardProps) {
    const birthdayDate = sneaker.date ? parseISO(sneaker.date) : null;
    const isBirthdayToday = birthdayDate ? isSameDay(birthdayDate, new Date()) : false;
    const birthdayLabel = birthdayDate ? (isBirthdayToday ? "Today" : format(birthdayDate, "d MMM")) : "";

    return (
        <Link to="/sneakers/$id" params={{ id: sneaker._id }} className={cn("min-w-60 block relative p-2 bg-secondary rounded-2xl hover:shadow-2xl hover:shadow-primary/5 group ring ring-border/75 hover:border-white/20 overflow-hidden transition-shadow duration-300 z-0", !birthday ? "w-full" : "pr-8 shrink-0")}>
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-fit h-full flex items-center gap-4 relative z-1">
                <SneakerPhoto sneaker={sneaker} />
                <div className="min-w-0 flex flex-col justify-center gap-y-2">
                    <div>
                        <h3 className="text-lg text-white group-hover:text-primary-200 font-bold tracking-tight truncate transition-colors">{sneaker.name}</h3>
                        <h3 className="text-sm text-zinc-300 group-hover:text-primary-100 font-medium truncate transition-colors">{sneaker.color}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 transition-colors">
                        {!birthday ? (
                            <>
                                <IconMapPin className="size-4 shrink-0 text-primary" />
                                <span className="text-sm font-semibold opacity-75 group-hover:opacity-100 truncate transition">
                                    {sneaker.location.name}
                                </span>
                            </>
                        ) : (
                            <>
                                {!isBirthdayToday ?
                                    <IconCalendarEvent className="size-4 shrink-0 text-primary" />
                                :
                                    <IconCake className="size-4 shrink-0 text-primary" />
                                }
                                <span className={cn("text-transparent text-sm font-semibold bg-linear-to-r from-zinc-400 via-zinc-400 to-zinc-400 bg-clip-text bg-size-[200%_100%] opacity-75 group-hover:opacity-100 truncate transition duration-300", isBirthdayToday && "via-white animate-text-glow-sweep")}>
                                    {birthdayLabel}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {!birthday && <div className="h-32 size-48 absolute -bottom-16 -right-24 bg-radial from-(--owner-color)/15 to-75% -z-1" style={{ "--owner-color": sneaker.owner.color } as React.CSSProperties} />}
        </Link>
    );
}

export function SneakerCardSkeleton() {
    return (
        <div className="w-full p-2 flex items-center gap-4 relative bg-secondary rounded-2xl ring ring-border">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-center flex-1">
                <Skeleton className="w-1/2 h-5.5 mb-1" />
                <Skeleton className="w-1/3 h-4.5 mb-2" />
                <div className="flex items-center gap-1.5">
                    <IconMapPin className="size-4 shrink-0 text-muted animate-pulse" />
                    <Skeleton className="w-1/5 h-4" />
                </div>
            </div>
        </div>
    )
}