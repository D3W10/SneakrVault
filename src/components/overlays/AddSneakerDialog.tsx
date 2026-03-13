import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import bridge from "@/data/bridge";
import type { Sneaker, User } from "@/lib/models";

interface AddSneakerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    sneaker?: Sneaker;
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
    const [type, setType] = useState<Sneaker["type"]>("Sneakers");
    const [originalOwnerType, setOriginalOwnerType] = useState<"local" | "outside">("local");
    const [originalOwnerId, setOriginalOwnerId] = useState("");
    const [originalOwnerName, setOriginalOwnerName] = useState("");
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

    function onSelect(val: string) {
        setOriginalOwnerType("local");
        setOriginalOwnerId(val);
        setOriginalOwnerName(owners?.find(o => o._id === val)?.username ?? "");
    }

    function onCustomSelect(val: string) {
        setOriginalOwnerType("outside");
        setOriginalOwnerId("");
        setOriginalOwnerName(val);
    }

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
                    type,
                    originalOwner: originalOwnerType === "local"
                        ? { type: "local", id: originalOwnerId }
                        : { type: "outside", name: originalOwnerName },
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
                    type,
                    originalOwner: originalOwnerType === "local"
                        ? { type: "local", id: originalOwnerId }
                        : { type: "outside", name: originalOwnerName },
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
        setBrand(sneaker?.brand._id ?? "");
        setPhoto(undefined);
        setLocation(sneaker?.location._id ?? "");
        setOwner(sneaker?.owner._id ?? "");
        setDate(sneaker?.date ? new Date(sneaker?.date) : null);
        setType(sneaker?.type ?? "Sneakers");
        if (sneaker?.originalOwner._id) {
            setOriginalOwnerType("local");
            setOriginalOwnerId(sneaker?.originalOwner._id);
            setOriginalOwnerName(owners?.find(o => o._id === sneaker?.originalOwner._id)?.username ?? "");
        } else if (sneaker?.originalOwner.username) {
            setOriginalOwnerType("outside");
            setOriginalOwnerId("");
            setOriginalOwnerName(sneaker.originalOwner.username);
        } else {
            setOriginalOwnerType("local");
            setOriginalOwnerId("");
            setOriginalOwnerName("");
        }
        setOriginalOwnerId(sneaker?.originalOwner?._id ?? "");
        setDecommissioned(sneaker?.decommissioned ?? false);
        setStockxUrl(sneaker?.stockxUrl ?? "");
        setError("");
    }, [open]);

    const selBrand = brands?.find(b => b._id === brand);
    const selLocation = locations?.find(l => l._id === location) ?? "Outside";
    const selOwner = owners?.find(o => o._id === owner);

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
                                        <Input id="sneakerSize" name="size" inputMode="numeric" placeholder="10" disabled={isSaving} value={size} onChange={e => /^[\d\.]*$/.test(e.target.value) && setSize(e.target.value)} />
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
                                            {photo && <span className="flex items-center absolute top-0 bottom-0 right-px left-25 text-muted-foreground overflow-hidden whitespace-nowrap z-1">{photo.name}</span>}
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
                                <div className="flex gap-2">
                                    <Field>
                                        <Label htmlFor="sneakerType">Type</Label>
                                        <Select value={type} disabled={isSaving} onValueChange={e => setType(e ?? "Sneakers")}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sneakers">Sneakers</SelectItem>
                                                <SelectItem value="Shoes">Shoes</SelectItem>
                                                <SelectItem value="Boots">Boots</SelectItem>
                                                <SelectItem value="Flip-flops">Flip-flops</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <Label htmlFor="sneakerOwner">Owner</Label>
                                        <Select value={owner} disabled={isSaving} onValueChange={e => setOwner(e ?? "")}>
                                            <SelectTrigger className="w-full">
                                                {!selOwner ? "Select an owner" : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2.5 rounded-full" style={{ backgroundColor: selOwner?.color }} />
                                                        {selOwner.username}
                                                    </div>
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(owners ?? []).map(o => (
                                                    <SelectItem value={o._id} key={o._id}>
                                                        <div className="size-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                                                        {o.username}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <div className="flex gap-2">
                                    <Field>
                                        <Label htmlFor="sneakerDate">Acquisition Date</Label>
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
                                        <Combobox items={owners ?? []} value={originalOwnerId} disabled={isSaving} onValueChange={e => e && onSelect(e)}>
                                            <ComboboxInput placeholder="Select an owner" value={originalOwnerName} disabled={isSaving} onChange={e => onCustomSelect(e.target.value)} />
                                            <ComboboxContent>
                                                <ComboboxEmpty>Create "{originalOwnerName.slice(0, 12)}{originalOwnerName.length > 12 && "..."}"</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(owner: User) => (
                                                        <ComboboxItem key={owner._id} value={owner._id}>
                                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                                                            {owner.username}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
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
                            <Button type="submit" className="sm:w-31" disabled={isSaving || !name || !color || !size || !brand || !location || stockxUrl.length !== 0 && !/^https:\/\/stockx\.com\/[a-zA-Z0-9-]+$/g.test(stockxUrl)}>
                                {!isSaving ? "Save changes" : <Spinner />}
                            </Button>
                        </DialogFooter>
                    </Tabs>
                </form>
            </DialogContent>
        </Dialog>
    );
}