import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Sneaker, Location } from "@/data/sneakerService";

interface SneakerCardProps {
    sneaker: Sneaker;
    location?: Location;
}

export function SneakerCard({ sneaker, location }: SneakerCardProps) {
    return (
        <Link
            to="/sneakers/$id"
            params={{ id: sneaker.id }}
            className="block p-4 group relative bg-white/5 rounded-3xl border border-white/10 hover:border-white/20 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-teal-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="h-full flex items-center gap-4 relative z-10">
                <div className="size-24 shrink-0 bg-black/20 rounded-lg overflow-hidden">
                    {sneaker.photo ? (
                        <img src={sneaker.photo} alt={sneaker.name} className="size-full bg-white object-contain" />
                    ) : (
                        <div className="size-full flex justify-center items-center text-zinc-700">
                            <span className="text-xs uppercase font-bold tracking-widest">No Image</span>
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex flex-col justify-center gap-y-2">
                    <div>
                        <h3 className="text-xl text-white group-hover:text-teal-200 font-bold tracking-tight truncate transition-colors">{sneaker.name}</h3>
                        <h3 className="text-md text-zinc-300 group-hover:text-teal-100 font-medium transition-colors">{sneaker.color}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        <MapPin className="size-4 text-teal-500 shrink-0" />
                        <span className="truncate">{location?.name || "Unknown Location"}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}