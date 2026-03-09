import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconLogout, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BirthdayBlock } from "@/components/blocks/BirthdayBlock";
import { CountBlock } from "@/components/blocks/CountBlock";
import { GridBlock } from "@/components/blocks/GridBlock";
import { AddSneakerDialog } from "@/components/overlays/AddSneakerDialog";
import { Header } from "@/components/Header";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { useLogout } from "@/lib/useLogout";
import { cn } from "@/lib/utils";
import type { Search } from "@/lib/models";
import type { Id } from "@db/dataModel";

export const Route = createFileRoute("/")({
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
    const containerRef = useRef<HTMLDivElement>(null);
    const auth = Route.useRouteContext().auth;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (!filtersOpen) return;

            const target = event.target as HTMLElement;
            const isInsideContainer = containerRef.current?.contains(target);
            const isInsidePopover = typeof target.closest === 'function' && target.closest('[data-slot="popover-content"]');

            if (!isInsideContainer && !isInsidePopover) {
                setFiltersOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [filtersOpen]);

    function addSneaker() {
        setAddDialogOpen(true);
    }

    return (
        <div className="min-h-screen">
            <Header
                left={auth?.role !== "guest" && (
                    <Button className="md:hidden" variant="outline" size="icon" onClick={addSneaker}>
                        <IconPlus className="size-5" />
                    </Button>
                )}
                right={
                    <>
                        <AddSneakerDialog open={addDialogOpen} setOpen={setAddDialogOpen} />
                        <Button className="md:hidden" variant="outline" size="icon" onClick={() => setSearchOpen(true)}>
                            <IconSearch className="size-5" />
                        </Button>
                        {auth?.role !== "guest" && (
                            <Button className="max-md:hidden" variant="outline" size="icon" onClick={addSneaker}>
                                <IconPlus className="size-5" />
                            </Button>
                        )}
                        <div ref={containerRef} className={cn("max-md:fixed max-md:left-0 max-md:right-0 max-md:p-6 max-md:ring max-md:transition-all max-md:duration-300", !searchOpen ? "max-md:-top-22 max-md:ring-transparent" : "max-md:top-0 max-md:ring-border ", !scrolling ? "max-md:bg-background" : "max-md:bg-accent")}>
                            <Popover open={filtersOpen}>
                                <PopoverTrigger nativeButton={false} render={<div className="md:w-88 max-md:py-1 flex gap-2" />} tabIndex={-1}>
                                    <InputGroup className="w-full bg-secondary">
                                        <InputGroupAddon>
                                            <IconSearch className="size-4 text-muted-foreground" />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            value={search.term}
                                            placeholder="Search sneakers..."
                                            onFocus={() => setFiltersOpen(true)}
                                            onChange={e => setSearch({ ...search, term: e.target.value })}
                                        />
                                    </InputGroup>
                                    <Button className="md:hidden" variant="outline" size="icon" onClick={() => setSearchOpen(false)}>
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
                                        name="Decommissioned"
                                        current={search.decommissioned}
                                        options={[{ id: true, label: "List" }, { id: false, label: "All" }]}
                                        unsetText="Hidden"
                                        setFilter={o => setSearch({ ...search, decommissioned: o })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button variant="outline" size="icon" onClick={logout}>
                            <IconLogout className="size-4.5" />
                        </Button>
                    </>
                }
                outScrolling={setScrolling}
            />
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
                <GridBlock search={search} onAdd={addSneaker} auth={auth} />
                <CountBlock search={search} />
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