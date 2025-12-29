import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { ArrowLeft, BadgeCheck, Calendar, Check, ChevronsUpDown, Hexagon, Link as LinkIcon, MapPin, User } from "lucide-react";
import { Headbar } from "@/components/Headbar";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { authIf, cn } from "@/lib/utils";
import { getLocations, getPersons, getSneaker, updatePick, updateSneakerLocation } from "@/data/sneakerService";

export const Route = createFileRoute("/sneakers/$id")({
    component: SneakerDetails,
    loader: ({ params }) => getSneaker({ data: params.id }),
});

function SneakerDetails() {
    const { auth } = Route.useRouteContext();
    const sneaker = Route.useLoaderData();
    const [locationOpen, setLocationOpen] = useState(false);
    const [locationValue, setLocationValue] = useState(-1);
    const [pickIdx, setPickIdx] = useState(-1);
    const [ownerIdx, setOwnerIdx] = useState(-1);
    const [originalOwnerIdx, setOriginalOwnerIdx] = useState(-1);
    const [pickMineState, setPickMineState] = useState<0 | 1 | 2>(0);
    const [pickOtherState, setPickOtherState] = useState<0 | 1 | 2>(0);
    const { data: persons } = useQuery({
        queryKey: ["persons"],
        queryFn: () => getPersons(),
    });
    const { data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: () => getLocations(),
    });
    const queryClient = useQueryClient();

    if (!auth || !sneaker)
        throw redirect({ to: "/" })

    const momentAcqDate = moment(sneaker.date);

    const handlePick = async (mine: boolean) => {
        if (!persons) return;

        const setter = mine ? setPickMineState : setPickOtherState;
        setter(1);

        await updatePick({ data: {
            personId: mine ? persons[auth.mine] : persons[auth.other],
            sneakerId: sneaker.id,
        }});

        queryClient.invalidateQueries({ queryKey: ["sneakers"] });
        setter(2);

        setTimeout(() => setter(0), 3000);
    }

    const handleLocationChange = async (i: number) => {
        if (!sneaker || !locations) return;

        sneaker.location = locations[i];

        await updateSneakerLocation({ data: {
            sneakerId: sneaker.id,
            location: locations[i],
        }});
    }

    useEffect(() => {
        setPickIdx(persons?.findIndex(p => p === sneaker.pick_to) ?? -1);
        setOwnerIdx(persons?.findIndex(p => p === sneaker.owner) ?? -1);
        setOriginalOwnerIdx(persons?.findIndex(p => p === sneaker.original_owner) ?? -1);
    }, [persons]);

    useEffect(() => {
        if (!sneaker || !locations) return;

        setLocationValue(locations.findIndex(l => l === sneaker.location));
    }, [sneaker, locations]);

    return (
        <div className="min-h-screen">
            <Headbar>
                <Link to="/" className="size-8 sm:w-fit sm:h-9 md:h-10 flex items-center absolute left-4 sm:left-6 md:static">
                    <Button variant="ghost" className="size-full px-2! md:px-3!">
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:block">Back</span>
                    </Button>
                </Link>
            </Headbar>
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-20 flex gap-12">
                <div className="flex flex-col flex-6 gap-6 md:gap-8">
                    <div className="w-full flex gap-6 md:gap-8">
                        <SneakerPhoto sneaker={sneaker} className="size-24 sm:size-28 md:size-32 rounded-lg shadow-2xl shadow-primary/25 animate-in fade-in zoom-in duration-500" />
                        <div className="flex flex-col justify-center gap-1 flex-1 animate-in fade-in duration-1000">
                            <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{sneaker.name}</h1> 
                            <h2 className="sm:text-xl md:text-lg lg:text-2xl font-bold text-secondary-foreground">{sneaker.color}</h2>
                        </div>
                    </div>
                    <div className="w-full p-6 flex flex-col gap-6 bg-secondary rounded-2xl ring ring-border/50 animate-in fade-in duration-1000">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Hexagon className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">State</span>
                            </div>
                            <div className="flex gap-4">
                                {!sneaker.decommissioned ? (
                                    <p className="px-3 py-1 text-primary font-bold bg-primary/25 rounded-md">Active</p>
                                ) : (
                                    <p className="px-3 py-1 text-destructive font-bold bg-destructive/25 rounded-md">Decommissioned</p>
                                )}
                                {moment(sneaker.pick_date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && sneaker.pick_to && pickIdx !== -1 && (
                                    <div className={cn("py-1.5 pl-2.5 pr-4 flex items-center gap-2.5 rounded-full animate-in fade-in duration-300", authIf(pickIdx, "bg-amber-500/25", "bg-cyan-500/25"))}>
                                        <div className={cn("size-3 rounded-full before:block before:size-3 before:rounded-full before:animate-ping", authIf(pickIdx, "bg-amber-500 before:bg-amber-500", "bg-cyan-500 before:bg-cyan-500"))}></div>
                                        <p className="text-secondary-foreground text-sm font-semibold">In use by {sneaker.pick_to}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <MapPin className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Location</span>
                            </div>
                            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={locationOpen}
                                        className={cn("w-full justify-between transition-[visibility] duration-300", locations ? "visible" : "invisible")}
                                    >
                                        {locations && locationValue !== -1 ? locations[locationValue] : "Select location..."}
                                        <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-background">
                                    <Command className="bg-transparent">
                                        <CommandList>
                                            <CommandEmpty>No locations found</CommandEmpty>
                                            <CommandGroup>
                                                {(locations ?? []).map((l, i) => (
                                                    <CommandItem
                                                        key={i}
                                                        value={i.toString()}
                                                        onSelect={() => {
                                                            setLocationValue(i);
                                                            setLocationOpen(false);
                                                            handleLocationChange(i);
                                                        }}
                                                        className="text-secondary-foreground aria-selected:bg-secondary aria-selected:text-foreground cursor-pointer"
                                                    >
                                                        {l}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <BadgeCheck className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Brand</span>
                            </div>
                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-secondary-foreground text-sm font-medium bg-accent rounded-md">
                                <img src={`/brands/${sneaker.brand}.svg`} alt={sneaker.brand} className="size-4" />
                                {sneaker.brand}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Calendar className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Acquisition Date</span>
                            </div>
                            <div className="w-fit px-3 py-1.5 flex items-center text-sm text-secondary-foreground font-bold bg-accent rounded-md">
                                {momentAcqDate.format("DD")}
                                <span className="px-1.5 text-muted-foreground">/</span>
                                {momentAcqDate.format("MM")}
                                <span className="px-1.5 text-muted-foreground">/</span>
                                {momentAcqDate.format("YYYY")}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <User className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Owner</span>
                            </div>
                            <div className={cn("w-fit px-3 py-1.5 flex items-center gap-2.5 bg-accent rounded-md transition-opacity duration-300", persons ? "opacity-100" : "opacity-0")}>
                                <div className={cn("size-3 shrink-0 rounded-full", authIf(ownerIdx, "bg-amber-500", "bg-cyan-500"))}></div>
                                <p className="text-secondary-foreground text-sm font-semibold">{sneaker.owner}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <User className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Original Owner</span>
                            </div>
                            <div className={cn("w-fit px-3 py-1.5 flex items-center gap-2.5 bg-accent rounded-md transition-opacity duration-300", persons ? "opacity-100" : "opacity-0")}>
                                <div className={cn("size-3 shrink-0 rounded-full", authIf(originalOwnerIdx, "bg-amber-500", "bg-cyan-500"))}></div>
                                <p className="text-secondary-foreground text-sm font-semibold">{sneaker.original_owner}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <LinkIcon className="size-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Links</span>
                            </div>
                            <div>
                                {sneaker.stockx_url ? (
                                    <a href={sneaker.stockx_url}>
                                        <Button variant="outline" className="px-3! gap-3">
                                            <img src="/StockX.svg" alt="StockX" className="size-4" />
                                            StockX
                                        </Button>
                                    </a>
                                ) : (
                                    <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-secondary-foreground text-sm font-medium bg-accent rounded-md">
                                        <p>No links for this pair</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-fit p-4 flex md:flex-col items-center gap-2 fixed md:static bottom-0 left-0 right-0 flex-3 bg-secondary rounded-t-2xl md:rounded-2xl ring ring-border/50 z-1">
                    <p className="hidden md:block mb-2 text-lg font-bold">Pick this sneaker</p>
                    <Button className="flex-2/3 md:w-full" onClick={() => handlePick(true)}>
                        {pickMineState === 0 ? (
                            <>
                                <span className="block md:hidden">Pick for me</span>
                                <span className="hidden md:block">For me</span>
                            </>
                        ) : pickMineState === 1 ? (
                            <Spinner className="size-5" />
                        ) : (
                            <Check className="size-5" />
                        )}
                        
                    </Button>
                    <Button variant="outline" className="flex-1/3 md:w-full" onClick={() => handlePick(false)}>
                        {pickOtherState === 0 ? (
                            "For him"
                        ) : pickOtherState === 1 ? (
                            <Spinner className="size-5" />
                        ) : (
                            <Check className="size-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}