import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SneakerCard } from "@/components/SneakerCard";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { getSneakers, getLocations } from "@/data/sneakerService";

export const Route = createFileRoute("/")({
    component: Index,
    loader: async () => {
        const [sneakers, locations] = await Promise.all([
            getSneakers(),
            getLocations(),
        ]);
        return { sneakers, locations };
    },
})

function Index() {
    const [search, setSearch] = useState("");
    const { sneakers, locations } = Route.useLoaderData();

    const filteredSneakers = sneakers.filter(sneaker => sneaker.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-teal-500 from-10% to-teal-700 to-90% text-transparent bg-clip-text">SneakLookup</h1>
                    <InputGroup className="w-full md:w-96 bg-zinc-900 border-zinc-800 focus-within:ring-teal-500/20 focus-within:border-teal-500/50">
                        <InputGroupAddon>
                            <Search className="w-4 h-4 text-zinc-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            placeholder="Search sneakers..."
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSneakers.map(sneaker => (
                        <SneakerCard
                            key={sneaker.id}
                            sneaker={sneaker}
                            location={locations.find(l => l.id === sneaker.location)}
                        />
                    ))}
                    {filteredSneakers.length === 0 && (
                        <span className="py-20 col-span-full text-center text-zinc-500">No sneakers found matching "{search}"</span>
                    )}
                </div>
            </div>
        </div>
    );
}