import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"

export function SneakerCardSkeleton() {
    return (
        <div className="w-full p-2 flex items-center gap-4 bg-secondary rounded-2xl ring ring-border/50">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-col justify-center flex-1 gap-y-3">
                <div className="space-y-1.5">
                    <Skeleton className="w-1/2 h-5" />
                    <Skeleton className="w-1/3 h-4.5" />
                </div>
                <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0 text-accent animate-pulse" />
                    <Skeleton className="w-1/5 h-4" />
                </div>
            </div>
        </div>
    )
}