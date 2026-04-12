import { useEffect, useState } from "react";
import { createFileRoute, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconChevronLeft, IconDots, IconMapPin, IconPencil, IconTrash, IconFolderPlus } from "@tabler/icons-react";
import { addDays, differenceInCalendarDays, differenceInYears, endOfDay, format, getYear, isBefore, isWithinInterval, parseISO, setYear, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { SneakerPhoto } from "@/components/SneakerPhoto";
import { SneakPickSelector } from "@/components/blocks/SneakPickBlock";
import { AddSneakerDialog } from "@/components/overlays/AddSneakerDialog";
import { AddToCollectionDialog } from "@/components/overlays/AddToCollectionDialog";
import { DeleteSneakerDialog } from "@/components/overlays/DeleteSneakerDialog";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";

export const Route = createFileRoute("/sneakers/$id")({
    component: SneakerDetails,
    beforeLoad: () => checkAuth(),
});

function SneakerDetails() {
    const [editOpen, setEditOpen] = useState(false);
    const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [acqDate, setAcqDate] = useState(new Date());
    const [bdayStats, setBdayStats] = useState<{ years: number; daysUntil: number; } | null>(null);
    const canGoBack = useCanGoBack()
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const { isPending, data: sneaker } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
        select: items => items.find(i => i._id === id),
    });
    const router = useRouter()
    const { auth } = Route.useRouteContext();

    function handleBack() {
        if (canGoBack)
            router.history.back()
        else
            navigate({ to: "/" })
    }

    useEffect(() => {
        if (!isPending) {
            if (!sneaker)
                navigate({ to: "/" });
            else {
                setAcqDate(sneaker.date ? parseISO(sneaker.date) : new Date());

                const today = startOfDay(new Date());
                const nextWeek = endOfDay(addDays(today, 7));

                if (sneaker?.date) {
                    const birthdayDate = parseISO(sneaker.date);
                    let currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today)));

                    if (isBefore(currentYearBirthday, today))
                        currentYearBirthday = startOfDay(setYear(birthdayDate, getYear(today) + 1));

                    if (isWithinInterval(currentYearBirthday, { start: today, end: nextWeek }))
                        setBdayStats({
                            years: differenceInYears(currentYearBirthday, birthdayDate),
                            daysUntil: differenceInCalendarDays(currentYearBirthday, today)
                        });
                }
            }
        }
    }, [isPending]);

    return (
        <div className="min-h-screen">
            <Header
                left={
                    <Button className="md:hidden" variant="outline" size="icon" onClick={handleBack}>
                        <IconChevronLeft className="size-5" />
                    </Button>
                }
                right={
                    <>
                        {sneaker && (
                            <>
                                <AddSneakerDialog open={editOpen} setOpen={setEditOpen} sneaker={sneaker} />
                                <AddToCollectionDialog open={addToCollectionOpen} setOpen={setAddToCollectionOpen} sneakerId={sneaker._id} />
                                <DeleteSneakerDialog open={deleteOpen} setOpen={setDeleteOpen} _id={sneaker._id} />
                            </>
                        )}
                        <Button className="max-md:hidden" variant="outline" onClick={handleBack}>
                            <IconChevronLeft className="size-5" data-icon="inline-start" />
                            Back to library
                        </Button>
                        {auth?.role !== "guest" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger render={
                                    <Button variant="outline" size="icon">
                                        <IconDots className="size-5" />
                                    </Button>
                                } />
                                <DropdownMenuContent className="w-42" align="end" sideOffset={8}>
                                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                        <IconPencil className="size-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAddToCollectionOpen(true)}>
                                        <IconFolderPlus className="size-4" />
                                        Add to collection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                                        <IconTrash className="size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </>
                }
            />
            <div className="max-w-7xl mx-auto pt-4 max-md:pb-44 max-md:pwa:pb-48 px-6 md:px-8 flex flex-col gap-6 sm:gap-8">
                <div className="w-full flex gap-5 sm:gap-6 md:gap-8">
                    {sneaker ? (
                        <>
                            <SneakerPhoto sneaker={sneaker} className="size-24 sm:size-28 md:size-32 rounded-lg ring ring-border shadow-2xl shadow-primary/25 animate-in fade-in zoom-in duration-500" />
                            <div className="flex flex-col justify-center gap-1 flex-1 animate-in fade-in duration-1000">
                                <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-4xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{sneaker.name}</h1>
                                <h2 className="sm:text-xl md:text-lg lg:text-2xl text-secondary-foreground font-bold">{sneaker.color}</h2>
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="size-24 sm:size-28 md:size-32 rounded-lg" />
                            <div className="flex flex-col justify-center gap-1 flex-1">
                                <Skeleton className="w-1/3 h-10" />
                                <Skeleton className="w-2/5 h-8" />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex gap-6">
                    {sneaker ? (
                        <div className="w-full h-fit py-6 flex flex-col gap-6 flex-1 bg-accent rounded-xl ring ring-border z-0">
                            {(sneaker.size || sneaker.brand._id || sneaker.location._id) && (
                                <div className="w-full px-6 flex gap-6 overflow-x-auto">
                                    {sneaker.size && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Size</h3>
                                            <p className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">{sneaker.size}</p>
                                        </div>
                                    )}
                                    {sneaker.brand._id && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Brand</h3>
                                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 bg-muted rounded-md">
                                                {sneaker.brand.iconUrl && <img src={sneaker.brand.iconUrl} alt={sneaker.brand.name} className="size-4 object-contain" />}
                                                <p className="text-sm font-semibold">{sneaker.brand.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    {sneaker.location._id && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Location</h3>
                                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 bg-muted rounded-md">
                                                <IconMapPin className="size-4 shrink-0 text-muted-foreground" />
                                                <p className="text-sm font-semibold">{sneaker.location.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="w-full px-6 flex gap-6 overflow-x-auto">
                                <div>
                                    <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">State</h3>
                                    <div className="flex items-center gap-4">
                                        {!sneaker.decommissioned ? (
                                            <p className="w-fit px-3 py-1.5 flex items-center text-emerald-500 text-sm font-semibold bg-emerald-500/15 rounded-md">Active</p>
                                        ) : (
                                            <p className="w-fit px-3 py-1.5 flex items-center text-primary text-sm font-semibold bg-primary/15 rounded-md">Decommissioned</p>
                                        )}
                                        {sneaker.pickFor && sneaker.pickUntil && new Date(sneaker.pickUntil).getTime() > new Date().getTime() && (
                                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 bg-muted rounded-md">
                                                <div className="size-2.5 bg-(--user-color) rounded-full before:size-2.5 before:block before:bg-(--user-color) before:rounded-full before:animate-ping" style={{ "--user-color": sneaker.pickFor.color || "var(--color-muted-foreground)" } as React.CSSProperties} />
                                                <p className="text-muted-foreground text-sm font-medium">In use by <span className="text-foreground font-bold">{sneaker.pickFor.username}</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {sneaker.date && (
                                <div className="w-full px-6 flex gap-6 overflow-x-auto">
                                    <div>
                                        <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Acquisition Date</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">
                                                {format(acqDate, "dd")}
                                                <span className="px-1.5 text-muted-foreground">/</span>
                                                {format(acqDate, "MM")}
                                                <span className="px-1.5 text-muted-foreground">/</span>
                                                {format(acqDate, "yyyy")}
                                            </div>
                                            {bdayStats && (
                                                <div className="w-fit px-3 py-1.5 flex items-center gap-1.5 text-amber-500 text-sm font-semibold bg-amber-500/15 rounded-md">
                                                    {bdayStats.years} {bdayStats.years === 1 ? "year" : "years"}
                                                    <span className="text-amber-500/60">{bdayStats.daysUntil === 0 ? "today!" : `in ${bdayStats.daysUntil} ${bdayStats.daysUntil === 1 ? "day" : "days"}`}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(sneaker.owner._id || sneaker.originalOwner.type) && (
                                <div className="w-full px-6 flex gap-6 overflow-x-auto">
                                    {sneaker.owner._id && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Owner</h3>
                                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-sm font-semibold bg-muted rounded-md">
                                                <div className="size-2.5 rounded-full" style={{ backgroundColor: sneaker.owner.color || "var(--color-muted-foreground)" }} />
                                                {sneaker.owner.username}
                                            </div>
                                        </div>
                                    )}
                                    {sneaker.originalOwner.type && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Original Owner</h3>
                                            <div className="w-fit px-3 py-1.5 flex items-center gap-2.5 text-sm font-semibold bg-muted rounded-md">
                                                <div className="size-2.5 rounded-full" style={{ backgroundColor: sneaker.originalOwner.color || "var(--color-muted-foreground)" }} />
                                                {sneaker.originalOwner.username}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {(sneaker.stockxUrl || sneaker.style) && (
                                <div className="w-full px-6 flex gap-6 overflow-x-auto">
                                    {sneaker.stockxUrl && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Links</h3>
                                            <a href={sneaker.stockxUrl} target="_blank">
                                                <Button variant="outline" className="gap-2.5">
                                                    <img src="/StockX.svg" alt="StockX" className="size-4" />
                                                    StockX
                                                </Button>
                                            </a>
                                        </div>
                                    )}
                                    {sneaker.style && (
                                        <div>
                                            <h3 className="mb-2 text-xs text-muted-foreground font-semibold tracking-wider uppercase">Style Code</h3>
                                            <p className="w-fit px-3 py-1.5 flex items-center text-sm font-semibold bg-muted rounded-md">{sneaker.style}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : <Skeleton className="h-80 flex-1 rounded-xl" />}
                    <SneakPickSelector sneaker={sneaker} auth={auth} />
                </div>
            </div>
        </div>
    );
}