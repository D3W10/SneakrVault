import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Sneaker } from "@/lib/models";

interface SneakerPhotoProps {
    sneaker?: Sneaker;
    small?: boolean;
    className?: string
}

export function SneakerPhoto({ sneaker, small, className }: SneakerPhotoProps) {
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <div className={cn("size-24 shrink-0", className)}>
            {isAvailable && sneaker?.photoUrl ? (
                <img src={sneaker.photoUrl} alt={sneaker.name + " " + sneaker.color} className="size-full bg-white/4 rounded-lg object-contain" onError={() => setIsAvailable(false)} />
            ) : (
                <div className="size-full flex justify-center items-center text-foreground/50 bg-white/4 rounded-lg">
                    {!small && <span className="text-xs uppercase font-bold">No Image</span>}
                </div>
            )}
        </div>
    );
}