import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { addBrand, editBrand } from "@/data/bridge";
import type { Doc } from "@db/dataModel";

interface AddBrandDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    brand?: Doc<"brands">;
}

export function AddBrandDialog({ open, setOpen, brand }: AddBrandDialogProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [wasModified, setWasModified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();

    function setSlugVal(slug: string) {
        setSlug(slug);
        setWasModified(true);
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!brand) {
            const result = await addBrand({
                data: {
                    name,
                    slug,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await editBrand({
                data: {
                    _id: brand._id,
                    name,
                    slug,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["brands"] });

        setOpen(false);
        setIsSaving(false);
    }

    useEffect(() => {
        if (!wasModified)
            setSlug(name.toLowerCase().replace(/[ .]/g, "-"));
    }, [name]);

    useEffect(() => {
        if (!open)
            return;

        setName(brand?.name ?? "");
        setSlug(brand?.slug ?? "");
        setWasModified(false);
        setError("");
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{!brand ? "Add brand" : "Edit brand"}</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="brandName">Name</Label>
                            <Input id="brandName" name="name" maxLength={35} placeholder={brand?.name ?? "Required"} value={name} onChange={e => setName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="brandSlug">Slug</Label>
                            <Input id="brandSlug" name="slug" maxLength={50} placeholder={brand?.name ?? "Required"} value={slug} onChange={e => setSlugVal(e.target.value)} />
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit" className="w-31" disabled={isSaving || !name}>
                            {!isSaving ? "Save changes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}