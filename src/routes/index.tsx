import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BirthdayBlock } from "@/components/blocks/BirthdayBlock";
import { GridBlock } from "@/components/blocks/GridBlock";
import { Header } from "@/components/Header";
import { api } from "@db/api";
import type { Search } from "@/lib/models";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const { auth } = Route.useRouteContext();
    const [search, setSearch] = useState<Search>({ term: "" });
    const { data: brands } = useSuspenseQuery(convexQuery(api.brands.get, {}));
    const { data: locations } = useSuspenseQuery(convexQuery(api.locations.get, {}));
    const { data: owners } = useSuspenseQuery(convexQuery(api.users.get, {}));

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
            <Header>
                <Popover>
                    <PopoverTrigger id={searchTriggerId} nativeButton={false} render={<div className="w-full md:w-88" />}>
                        <InputGroup className="w-full bg-secondary">
                            <InputGroupAddon>
                                <IconSearch className="size-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                id={searchInputId}
                                value={search.term}
                                placeholder="Search sneakers..."
                                onChange={e => setSearch({ ...search, term: e.target.value })}
                            />
                        </InputGroup>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--anchor-width) px-3 py-2.5" initialFocus={false} finalFocus={false}>
                        <FilterGroup
                            name="Location"
                            current={search.location}
                            options={[...locations.map(l => ({ id: l._id, label: l.name })), { id: "outside", label: "Outside" }] as { id: Id<"locations"> | "outside" | undefined; label: string }[]}
                            setFilter={l => setSearch({ ...search, location: l })}
                        />
                        <FilterGroup
                            name="Brand"
                            current={search.brand}
                            options={brands.map(b => ({ id: b._id, label: b.name }))}
                            setFilter={b => setSearch({ ...search, brand: b })}
                        />
                        <FilterGroup
                            name="Owner"
                            current={search.owner}
                            options={owners.map(o => ({ id: o._id, label: o.username }))}
                            setFilter={o => setSearch({ ...search, owner: o })}
                        />
                        <FilterGroup
                            name="Decommissioned"
                            current={search.decommissioned}
                            options={[{ id: true, label: "List" }, { id: false, label: "All" }]}
                            unsetText="Hidden"
                            setFilter={o => setSearch({ ...search, decommissioned: o })}
                        />
                    </PopoverContent>
                </Popover>
            </Header>
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

                <BirthdayBlock search={search} />
                <GridBlock search={search} />
            </div>
        </div>
    );
}

interface FilterGroupProps<T> {
    name: string;
    current: T | undefined;
    options: { id: T; label: string }[];
    unsetText?: string;
    setFilter: (filter: T | undefined) => void;
}

function FilterGroup<T>({ name, current, options, unsetText, setFilter }: FilterGroupProps<T>) {
    return (
        <div className="space-y-1.5">
            <h4 className="font-semibold text-xs text-muted-foreground">{name}</h4>
            <div className="flex flex-wrap gap-1.5">
                <Button
                    className="h-7 text-xs rounded-full"
                    size="sm"
                    variant={current === undefined ? "default" : "outline"}
                    onClick={() => setFilter(undefined)}
                >
                    {unsetText ?? "All"}
                </Button>
                {options.map((l, i) => (
                    <Button
                        key={i}
                        className="h-7 text-xs rounded-full"
                        size="sm"
                        variant={current === l.id ? "default" : "outline"}
                        onClick={() => setFilter(l.id)}
                    >
                        {l.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}