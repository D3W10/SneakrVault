import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import bridge from "@/data/bridge";
import type { Doc } from "@db/dataModel";

interface AddSneakerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    sneaker?: Doc<"sneakers">;
}

export function AddSneakerDialog({ open, setOpen, sneaker }: AddSneakerDialogProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [brand, setBrand] = useState("");
    const [photo, setPhoto] = useState<File | null>();
    const [location, setLocation] = useState("");
    const [owner, setOwner] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [originalOwner, setOriginalOwner] = useState("");
    const [decommissioned, setDecommissioned] = useState(false);
    const [stockxUrl, setStockxUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
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
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        let photoId: string | null | undefined;
        if (photo) {
            const url = await bridge.storage.generate();
            const upload = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": photo.type },
                body: photo,
            });
            photoId = (await upload.json()).storageId;
        } else
            photoId = photo;

        if (!sneaker) {
            const result = await bridge.sneakers.add({
                data: {
                    name,
                    color,
                    size: +size,
                    brand,
                    photo: photoId ?? undefined,
                    location,
                    owner: owner || undefined,
                    date: date?.toISOString(),
                    originalOwner: originalOwner || undefined,
                    decommissioned,
                    stockxUrl,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.sneakers.edit({
                data: {
                    _id: sneaker._id,
                    name,
                    color,
                    size: +size,
                    brand,
                    photo: photoId,
                    location,
                    owner: owner || undefined,
                    date: date?.toISOString(),
                    originalOwner: originalOwner || undefined,
                    decommissioned,
                    stockxUrl,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["sneakers"] });

        setOpen(false);
        setIsSaving(false);
    }

    useEffect(() => {
        if (!open)
            return;

        setName(sneaker?.name ?? "");
        setColor(sneaker?.color ?? "");
        setSize(sneaker?.size.toString() ?? "");
        setBrand(sneaker?.brand ?? "");
        setPhoto(undefined);
        setLocation(sneaker?.location ?? "");
        setOwner(sneaker?.owner ?? "");
        setDate(sneaker?.date ? new Date(sneaker?.date) : null);
        setOriginalOwner(sneaker?.originalOwner ?? "");
        setDecommissioned(sneaker?.decommissioned ?? false);
        setStockxUrl(sneaker?.stockxUrl ?? "");
        setError("");
    }, [open]);

    const selBrand = brands?.find(b => b._id === brand);
    const selLocation = locations?.find(l => l._id === location) ?? "Outside";
    const selOwner = owners?.find(o => o._id === owner);
    const selOriginalOwner = owners?.find(o => o._id === originalOwner);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="gap-6">
                        <DialogHeader>
                            <DialogTitle>Add sneaker</DialogTitle>
                            <TabsList variant="line">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="additional">Additional</TabsTrigger>
                            </TabsList>
                        </DialogHeader>
                        <TabsContent value="basic">
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="sneakerName">Name</Label>
                                    <Input id="sneakerName" name="name" maxLength={30} placeholder="Required" disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                                </Field>
                                <div className="flex gap-2">
                                    <Field className="flex-4">
                                        <Label htmlFor="sneakerColor">Color</Label>
                                        <Input id="sneakerColor" name="color" maxLength={50} placeholder="Required" disabled={isSaving} value={color} onChange={e => setColor(e.target.value)} />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="sneakerSize">Size</Label>
                                        <Input id="sneakerSize" name="size" inputMode="numeric" placeholder="10" disabled={isSaving} value={size} onChange={e => /^\d*$/.test(e.target.value) && setSize(e.target.value)} />
                                    </Field>
                                </div>
                                <div className="flex gap-2">
                                    <Field>
                                        <Label htmlFor="sneakerBrand">Brand</Label>
                                        <Select value={brand} disabled={isSaving} onValueChange={e => setBrand(e ?? "")}>
                                            <SelectTrigger className="w-full">
                                                {!selBrand ? "Select a brand" : (
                                                    <div className="flex items-center gap-2">
                                                        {selBrand.iconUrl && <img src={selBrand.iconUrl} alt={selBrand.name} className="size-4 object-contain" />}
                                                        {selBrand.name}
                                                    </div>
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(brands ?? []).map(b => (
                                                    <SelectItem value={b._id} key={b._id}>
                                                        {b.iconUrl && <img src={b.iconUrl} alt={b.name} className="size-4 object-contain" />}
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <Label htmlFor="sneakerLocation">Location</Label>
                                        <Select value={location} disabled={isSaving} onValueChange={e => setLocation(e ?? "outside")}>
                                            <SelectTrigger className="w-full">
                                                {!selLocation ? "Select a location" : typeof selLocation === "object" ? selLocation.name : "Outside"}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(locations ?? []).map(l => (
                                                    <SelectItem value={l._id} key={l._id}>{l.name}</SelectItem>
                                                ))}
                                                <SelectItem value="outside">Outside</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field>
                                    <Label htmlFor="sneakerPhoto">Photo</Label>
                                    <div className="flex gap-2">
                                        <div className="w-full relative">
                                            <Input id="sneakerPhoto" name="photo" type="file" className={photo ? "text-transparent!" : ""} disabled={isSaving} accept="image/*" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
                                            {photo && <span className="flex items-center absolute top-0 bottom-0 right-0 left-25 text-muted-foreground z-1">{photo.name}</span>}
                                        </div>
                                        {sneaker?.photo && (
                                            <Button variant="outline" size="icon" disabled={isSaving || photo === null} onClick={() => setPhoto(null)}>
                                                <IconTrash className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </Field>
                            </FieldGroup>
                        </TabsContent>
                        <TabsContent value="additional">
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="sneakerOwner">Owner</Label>
                                    <Select value={owner} disabled={isSaving} onValueChange={e => setOwner(e ?? "")}>
                                        <SelectTrigger className="w-full">
                                            {!selOwner ? "Select an owner" : selOwner.username}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(owners ?? []).map(l => (
                                                <SelectItem value={l._id} key={l._id}>{l.username}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <div className="flex gap-2">
                                    <Field>
                                        <Label htmlFor="sneakerDate">Date</Label>
                                        <Popover>
                                            <PopoverTrigger disabled={isSaving} render={<Button variant={"outline"} data-empty={!date} className="pl-2.5 justify-between font-normal data-[empty=true]:text-muted-foreground">{date ? format(date, "PPP") : <span>Pick a date</span>}<IconChevronDown data-icon="inline-end" /></Button>} />
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    required
                                                    selected={date ?? undefined}
                                                    onSelect={setDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </Field>
                                    <Field>
                                        <Label htmlFor="sneakerOriginalOwner">Original owner</Label>
                                        <Select value={originalOwner} disabled={isSaving} onValueChange={e => setOriginalOwner(e ?? "")}>
                                            <SelectTrigger className="w-full">
                                                {!selOriginalOwner ? "Select an owner" : selOriginalOwner.username}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(owners ?? []).map(l => (
                                                    <SelectItem value={l._id} key={l._id}>{l.username}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field>
                                    <Label htmlFor="sneakerStockX">StockX Url</Label>
                                    <Input id="sneakerStockX" name="stockx" inputMode="url" placeholder="https://stockx.com/nike-air-max-plus-triple-black" disabled={isSaving} value={stockxUrl} onChange={e => setStockxUrl(e.target.value)} />
                                </Field>
                                <Field orientation="horizontal" className="w-fit">
                                    <Checkbox id="sneakerDecommissioned" disabled={isSaving} checked={decommissioned} onCheckedChange={e => setDecommissioned(!!e)} />
                                    <FieldLabel htmlFor="sneakerDecommissioned">Decommissioned</FieldLabel>
                                </Field>
                            </FieldGroup>
                        </TabsContent>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <DialogFooter>
                            <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                            <Button type="submit" className="sm:w-31" disabled={isSaving || !name || !color || !size || !brand || !location}>
                                {!isSaving ? "Save changes" : <Spinner />}
                            </Button>
                        </DialogFooter>
                    </Tabs>
                </form>
            </DialogContent>
        </Dialog>
    );
}