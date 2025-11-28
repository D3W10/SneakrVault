import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Palette } from "lucide-react";
import { LocationCombobox } from "@/components/LocationCombobox";
import { Button } from "@/components/ui/button";
import { getSneaker, getLocations, updateSneakerLocation } from "@/data/sneakerService";

export const Route = createFileRoute("/sneakers/$id")({
    component: SneakerDetails,
    loader: async ({ params }) => {
        const [sneaker, locations] = await Promise.all([
            getSneaker({ data: params.id }),
            getLocations(),
        ]);
        return { sneaker, locations };
    },
});

function SneakerDetails() {
    const { sneaker: initialSneaker, locations } = Route.useLoaderData();
    const [sneaker, setSneaker] = useState(initialSneaker);

    const handleLocationChange = async (newLocationId: string) => {
        if (!sneaker) return;

        setSneaker({ ...sneaker, location: newLocationId });

        await updateSneakerLocation({ data: {
            sneakerId: sneaker.id,
            location: newLocationId,
        }});
    }

    return (
        <div className="min-h-screen flex flex-col text-white">
            <div className="p-8">
                <Link to="/">
                    <Button variant="ghost" className="pl-0 text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to list
                    </Button>
                </Link>
            </div>
            <div className="w-full max-w-4xl mx-auto pt-16 pb-42 flex flex-col justify-center items-center flex-1 text-center animate-in fade-in zoom-in duration-500">
                {!sneaker ? (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-3xl md:text-6xl text-transparent font-black bg-gradient-to-b from-white to-zinc-600 bg-clip-text tracking-tighter leading-tight">Sneaker not found</h1>
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-xs mb-8 bg-white/5 rounded-2xl border border-white/10 shadow-2xl shadow-teal-500/40 overflow-hidden aspect-square">
                            {sneaker.photo ? (
                                <img src={sneaker.photo} alt={sneaker.name} className="size-full bg-white object-contain" />
                            ) : (
                                <div className="size-full flex justify-center items-center text-zinc-700">
                                    <span className="text-sm uppercase tracking-widest font-bold">No Image Available</span>
                                </div>
                            )}
                        </div>
                        <h1 className="mb-20 text-3xl md:text-6xl text-transparent font-black bg-gradient-to-b from-white to-zinc-600 bg-clip-text tracking-tighter leading-tight">{sneaker.name}</h1>
                        <div className="w-full max-w-md p-8 bg-white/5 rounded-3xl border border-white/10 space-y-8 backdrop-blur-sm">
                            <div className="w-full space-y-4">
                                <div className="mb-3 flex items-center gap-2 text-zinc-400">
                                    <Palette className="size-4" />
                                    <span className="text-sm uppercase tracking-wider font-medium">Color</span>
                                </div>
                                <div className="w-full h-9 px-4 py-2 text-sm font-medium bg-white/5 rounded-md border border-white/10">
                                    {sneaker.color}
                                </div>
                            </div>
                            <div className="w-full space-y-4">
                                <div className="mb-3 flex items-center gap-2 text-zinc-400">
                                    <MapPin className="size-4" />
                                    <span className="text-sm uppercase tracking-wider font-medium">Current Location</span>
                                </div>
                                <LocationCombobox
                                    locations={locations}
                                    value={sneaker.location}
                                    onChange={handleLocationChange}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}