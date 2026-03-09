import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";

interface AddSneakerDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
}

export function AddSneakerDialog({ open, setOpen }: AddSneakerDialogProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState(0);
    const [date, setDate] = useState("");
    const [brand, setBrand] = useState("");
    const [location, setLocation] = useState("");
    const [owner, setOwner] = useState("");
    const [originalOwner, setOriginalOwner] = useState("");
    const [decommissioned, setDecommissioned] = useState(false);
    const [stockxUrl, setStockxUrl] = useState("");
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: bridge.brands.get,
    });



    /* 
        size: v.number(),
        date: v.string(),
        slug: v.string(),
        brand: v.id("brands"),
        location: v.union(v.id("locations"), v.literal("outside")),
        owner: v.optional(v.id("users")),
        originalOwner: v.optional(v.id("users")),
        decommissioned: v.boolean(),
        pickDate: v.optional(v.string()),
        pickTo: v.optional(v.id("users")),
        stockxUrl: v.optional(v.string()), */
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Add sneaker</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="sneakerName">Name</Label>
                            <Input id="sneakerName" name="name" maxLength={30} placeholder="Required" disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="sneakerColor">Color</Label>
                            <Input id="sneakerColor" name="color" maxLength={50} placeholder="Required" disabled={isSaving} value={color} onChange={e => setColor(e.target.value)} />
                        </Field>
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
                        <Field orientation="horizontal" className="w-fit">
                            <Checkbox id="sneakerDecommissioned" disabled={isSaving} checked={decommissioned} onCheckedChange={e => setDecommissioned(!!e)} />
                            <FieldLabel htmlFor="sneakerDecommissioned">Decommissioned</FieldLabel>
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit" className="sm:w-31">
                            {!isSaving ? "Save changes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}