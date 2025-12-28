import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Sneaker } from "@/data/sneakerService";

export function SneakerPhoto({ sneaker, small, className }: { sneaker?: Sneaker, small?: boolean, className?: string }) {
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <div className={cn("size-24 shrink-0", className)}>
            {isAvailable && sneaker && sneaker.photo ? (
                <img src={sneaker.photo} alt={sneaker.name + " " + sneaker.color} className="size-full bg-white/4 rounded-lg object-contain" onError={() => setIsAvailable(false)} />
            ) : (
                <div className="size-full flex justify-center items-center text-foreground/50 bg-white/4 rounded-lg">
                    {!small && <span className="text-xs uppercase font-bold">No Image</span>}
                </div>
            )}
        </div>
    );
}