import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconFilter2, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BirthdayBlock } from "@/components/blocks/BirthdayBlock";
import { CountBlock } from "@/components/blocks/CountBlock";
import { GridBlock } from "@/components/blocks/GridBlock";
import { SneakPickBlock } from "@/components/blocks/SneakPickBlock";
import { AddSneakerDialog } from "@/components/overlays/AddSneakerDialog";
import { Header } from "@/components/Header";
import { UserMenu } from "@/components/UserMenu";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { sneakerTypes, type Search } from "@/lib/models";
import { useLogout } from "@/lib/useLogout";
import { useConfig } from "@/lib/useConfig";
import { useOutsideClick } from "@/lib/useOutsideClick";
import { cn } from "@/lib/utils";
import type { Id } from "@db/dataModel";

export const Route = createFileRoute("/_app/")({
    component: Index,
    beforeLoad: () => checkAuth(),
});

function Index() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [search, setSearch] = useState<Search>({ term: "" });
    const [searchOpen, setSearchOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const logout = useLogout();
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: bridge.brands.get,
    });
    const { data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: bridge.locations.get,
    });
    const { data: owners } = useQuery({
        queryKey: ["owners"],
        queryFn: bridge.users.getOwners,
    });
    const configs = useConfig();
    const containerRef = useRef<HTMLDivElement>(null);
    const { auth } = Route.useRouteContext();

    function addSneaker() {
        setAddDialogOpen(true);
    }

    function onMobileChange(term: string) {
        setFiltersOpen(false);
        setSearch({ ...search, term })
    }

    function closeSearch() {
        setSearchOpen(false);
        setFiltersOpen(false);
    }

    useOutsideClick(containerRef, () => setFiltersOpen(false));

    return (
        <div className="min-h-screen">
            <Header
                left={
                    auth.role !== "guest" && (
                        <Button className="md:hidden" variant="outline" size="icon" onClick={addSneaker}>
                            <IconPlus className="size-5" />
                        </Button>
                    )
                }
                right={
                    <>
                        <AddSneakerDialog open={addDialogOpen} setOpen={setAddDialogOpen} />
                        <Button className="md:hidden" variant="outline" size="icon" onClick={() => setSearchOpen(true)}>
                            <IconSearch className="size-5" />
                        </Button>
                        {auth.role !== "guest" && (
                            <Button className="max-md:hidden" variant="outline" size="icon" onClick={addSneaker}>
                                <IconPlus className="size-5" />
                            </Button>
                        )}
                        <div
                            ref={containerRef}
                            className={cn(
                                "max-md:fixed max-md:left-0 max-md:right-0 max-md:p-6 max-md:ring max-md:transition-all max-md:duration-300",
                                !searchOpen ? "max-md:-top-22 max-md:ring-transparent" : "max-md:top-0 max-md:ring-border ",
                                !scrolling ? "max-md:bg-background" : "max-md:bg-accent",
                            )}
                        >
                            <Popover open={filtersOpen}>
                                <PopoverTrigger nativeButton={false} render={<div className="md:w-88 max-md:py-1 flex gap-2" />} tabIndex={-1}>
                                    <InputGroup className="w-full bg-secondary">
                                        <InputGroupAddon>
                                            <IconSearch className="size-4 text-muted-foreground" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            className="max-md:hidden"
                                            value={search.term}
                                            placeholder="Search sneakers..."
                                            onFocus={() => setFiltersOpen(true)}
                                            onChange={e => setSearch({ ...search, term: e.target.value })}
                                        />
                                        <InputGroupInput
                                            className="md:hidden"
                                            value={search.term}
                                            placeholder="Search sneakers..."
                                            onChange={e => onMobileChange(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Button className="md:hidden" variant="outline" size="icon" onClick={() => setFiltersOpen(!filtersOpen)}>
                                        <IconFilter2 className="size-5" />
                                    </Button>
                                    <Button className="md:hidden" variant="outline" size="icon" onClick={() => closeSearch()}>
                                        <IconX className="size-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--anchor-width) px-3 py-2.5" initialFocus={false} finalFocus={false} sideOffset={6}>
                                    <FilterGroup
                                        name="Location"
                                        current={search.location}
                                        options={[...(locations ?? []).map(l => ({ id: l._id, label: l.name })), { id: "outside", label: "Outside" }] as { id: Id<"locations"> | "outside" | undefined; label: string }[]}
                                        setFilter={l => setSearch({ ...search, location: l })}
                                    />
                                    <FilterGroup
                                        name="Brand"
                                        current={search.brand}
                                        options={(brands ?? []).map(b => ({ id: b._id, label: b.name }))}
                                        setFilter={b => setSearch({ ...search, brand: b })}
                                    />
                                    <FilterGroup
                                        name="Owner"
                                        current={search.owner}
                                        options={(owners ?? []).map(o => ({ id: o._id, label: o.username }))}
                                        setFilter={o => setSearch({ ...search, owner: o })}
                                    />
                                    <FilterGroup
                                        name="Type"
                                        current={search.type}
                                        options={sneakerTypes.map(o => ({ id: o, label: o }))}
                                        setFilter={t => setSearch({ ...search, type: t })}
                                    />
                                    <FilterGroup
                                        name="Decommissioned"
                                        current={search.decommissioned}
                                        options={[
                                            { id: true, label: "List" },
                                            { id: false, label: "All" },
                                        ]}
                                        unsetText="Hidden"
                                        setFilter={d => setSearch({ ...search, decommissioned: d })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <UserMenu auth={auth} logout={logout} />
                    </>
                }
                outScrolling={setScrolling}
            />
            <div className="max-w-7xl mx-auto pt-4 pb-20 flex flex-col gap-8">
                {config.homePageSections.map((section, idx) => {
                    if (section === "SneakPick") return config.enableSneakPick && <SneakPickBlock key={idx} search={search} />;
                    else if (section === "Birthday") return <BirthdayBlock key={idx} search={search} />;
                    else if (section === "Grid") return <GridBlock key={idx} search={search} onAdd={addSneaker} auth={auth} />;
                    else if (section === "Count") return <CountBlock key={idx} search={search} />;
                    else return null;
                })}
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
                <Button className="h-7 text-xs rounded-full" size="sm" variant={current === undefined ? "default" : "outline"} onClick={() => setFilter(undefined)}>
                    {unsetText ?? "All"}
                </Button>
                {options.map((l, i) => (
                    <Button key={i} className="h-7 text-xs rounded-full" size="sm" variant={current === l.id ? "default" : "outline"} onClick={() => setFilter(l.id)}>
                        {l.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
