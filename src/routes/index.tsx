import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Cake, LayoutGrid, Search } from "lucide-react";
import moment from "moment";
import { Headbar } from "@/components/Headbar";
import { SneakerCard } from "@/components/SneakerCard";
import { SneakerCardSkeleton } from "@/components/SneakerCardSkeleton";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { authIf, cn } from "@/lib/utils";
import { getSneakers, getPersons, getLocations } from "@/data/sneakerService";
import type { Sneaker } from "@/data/sneakerService";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const { auth } = Route.useRouteContext();
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [locationFilter, setLocationFilter] = useState<string | null>(null);
    const [sneakers, setSneakers] = useState<Sneaker[]>([]);
    const [pickedMine, setPickedMine] = useState<Sneaker | undefined>();
    const [pickedOther, setPickedOther] = useState<Sneaker | undefined>();
    const { data: rawSneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: () => getSneakers(),
    });
    const { data: persons } = useQuery({
        queryKey: ["persons"],
        queryFn: () => getPersons(),
    });
    const { data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: () => getLocations(),
    });

    if (!auth)
        return;

    const today = moment().startOf("day");
    const nextWeek = moment().add(7, "days").endOf("day");
    const upcomingBirthdays = sneakers.filter(s => {
        const birthdayDate = moment(s.date);
        const currentYearBirthday = birthdayDate.clone().year(today.year());

        if (currentYearBirthday.isBefore(today, "day"))
            currentYearBirthday.add(1, "year");

        return currentYearBirthday.isBetween(today, nextWeek, "day", "[]");
    }).sort((a, b) => {
        const bdayA = moment(a.date).year(today.year());
        if (bdayA.isBefore(today, "day")) bdayA.add(1, "year");

        const bdayB = moment(b.date).year(today.year());
        if (bdayB.isBefore(today, "day")) bdayB.add(1, "year");

        return bdayA.diff(bdayB);
    });

    useEffect(() => {
        if (rawSneakers)
            setSneakers(rawSneakers.filter(sneaker => 
                sneaker.name.toLowerCase().includes(search.toLowerCase()) &&
                (!locationFilter || sneaker.location === locationFilter)
            ));
    }, [rawSneakers, search, locations, locationFilter]);

    useEffect(() => {
        if (rawSneakers && persons) {
            setPickedMine(rawSneakers.find(s => s.pick_date && moment(s.pick_date).format("YYYY-MM-DD") === moment(Date.now()).format("YYYY-MM-DD") && s.pick_to === persons[auth.mine]));
            setPickedOther(rawSneakers.find(s => s.pick_date && moment(s.pick_date).format("YYYY-MM-DD") === moment(Date.now()).format("YYYY-MM-DD") && s.pick_to === persons[auth.other]));
        }
    }, [rawSneakers, persons]);

    return (
        <div className="min-h-screen">
            <Headbar>
                <Popover open={searchOpen} onOpenChange={setSearchOpen} modal={false}>
                    <PopoverAnchor asChild>
                        <InputGroup className="w-full md:w-96 bg-secondary">
                            <InputGroupAddon>
                                <Search className="size-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                value={search}
                                placeholder="Search sneakers..."
                                onFocus={() => setSearchOpen(true)}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </PopoverAnchor>
                    <PopoverContent align="start" className="w-(--radix-popper-anchor-width) p-3 pt-2 space-y-2" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <h4 className="font-medium text-sm text-muted-foreground">Filter by Location</h4>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={locationFilter === null ? "default" : "outline"}
                                onClick={() => setLocationFilter(null)}
                                className="h-7 text-xs rounded-full"
                            >
                                All
                            </Button>
                            {(locations ?? []).map(l => (
                                <Button
                                    key={l}
                                    size="sm"
                                    variant={locationFilter === l ? "default" : "outline"}
                                    onClick={() => setLocationFilter(l === locationFilter ? null : l)}
                                    className="h-7 text-xs rounded-full"
                                >
                                    {l}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </Headbar>
            <div className="max-w-7xl mx-auto pt-4 pb-20 flex flex-col gap-8">
                {search.length === 0 && !locationFilter && (
                    <div className="px-6 md:px-8 pt-px pb-4 flex gap-6 overflow-x-auto">
                        <Link to={"/sneakers/" + pickedMine?.id} disabled={!pickedMine} className={cn("p-1 pr-6 flex items-center gap-2 shrink-0 bg-secondary rounded-full shadow-lg ring ring-border/50", authIf(auth.mine, "shadow-amber-500/25", "shadow-cyan-500/25"))}>
                            <SneakerPhoto sneaker={pickedMine} small className="size-12 rounded-full overflow-hidden" />
                            <div className="space-y-0.5">
                                <p className={cn("text-xs font-semibold", authIf(auth.mine, "text-amber-500", "text-cyan-500"))}>{persons && auth ? persons[auth.mine] : " "}</p>
                                {pickedMine ? (
                                    <p className="text-sm font-semibold">{pickedMine.name}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground font-semibold">No sneaker picked</p>
                                )}
                            </div>
                        </Link>
                        <Link to={"/sneakers/" + pickedOther?.id} disabled={!pickedOther} className={cn("p-1 pr-6 flex items-center gap-2 shrink-0 bg-secondary rounded-full shadow-lg ring ring-border/50", authIf(auth.other, "shadow-amber-500/25", "shadow-cyan-500/25"))}>
                            <SneakerPhoto sneaker={pickedOther} small className="size-12 rounded-full overflow-hidden" />
                            <div className="space-y-0.5">
                                <p className={cn("text-xs font-semibold", authIf(auth.other, "text-amber-500", "text-cyan-500"))}>{persons && auth ? persons[auth.other] : " "}</p>
                                {pickedOther ? (
                                    <p className="text-sm font-semibold">{pickedOther.name}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground font-semibold">No sneaker picked</p>
                                )}
                            </div>
                        </Link>
                    </div>
                )}
                {search.length === 0 && !locationFilter && upcomingBirthdays.length !== 0 && (
                    <div className="px-6 md:px-8 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Cake className="size-5 text-primary" />
                            <h2 className="text-xl font-bold text-white">Upcoming Birthdays</h2>
                        </div>
                        <div className="p-px pb-4 flex gap-4 overflow-x-auto">
                            {upcomingBirthdays.map(s => (
                                <SneakerCard 
                                    key={s.id} 
                                    sneaker={s} 
                                    birthday 
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div className="px-6 md:px-8 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        {search.length === 0 && !locationFilter ? (
                            <LayoutGrid className="size-5 text-primary" />
                        ) : (
                            <Search className="size-5 text-primary" />
                        )}
                        <h2 className="text-xl font-bold text-white">{search.length === 0 && !locationFilter ? "All Sneakers" : "Search Results"}</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {!rawSneakers ? (
                            Array(15).fill(null).map((_, i) => <SneakerCardSkeleton key={i} />)
                        ) : sneakers.length !== 0 ? (
                            sneakers.map(sneaker => (
                                <SneakerCard
                                    key={sneaker.id}
                                    sneaker={sneaker}
                                />
                            ))
                        ) : (
                            <span className="py-20 col-span-full text-center text-muted-foreground">No sneakers found matching "{search}"</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}