import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

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
                            <Input id="sneakerName" name="name" maxLength={30} placeholder="Required" value={name} onChange={e => setName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="sneakerColor">Color</Label>
                            <Input id="sneakerColor" name="color" maxLength={40} placeholder="Required" value={color} onChange={e => setColor(e.target.value)} />
                        </Field>
                        <Field orientation="horizontal" className="w-fit">
                            <Checkbox id="sneakerDecommissioned" checked={decommissioned} onCheckedChange={e => setDecommissioned(!!e)} />
                            <FieldLabel htmlFor="sneakerDecommissioned">Decommissioned</FieldLabel>
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit" className="w-31">
                            {!isSaving ? "Save changes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}