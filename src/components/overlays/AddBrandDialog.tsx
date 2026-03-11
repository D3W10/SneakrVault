import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import type { Doc } from "@db/dataModel";

interface AddBrandDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    brand?: Doc<"brands">;
}

export function AddBrandDialog({ open, setOpen, brand }: AddBrandDialogProps) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState<File | null>();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        let iconId: string | null | undefined;
        if (icon) {
            const url = await bridge.storage.generate();
            const upload = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": icon.type },
                body: icon,
            });
            iconId = (await upload.json()).storageId;
        } else
            iconId = icon;

        if (!brand) {
            const result = await bridge.brands.add({
                data: {
                    name,
                    icon: iconId ?? undefined,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.brands.edit({
                data: {
                    _id: brand._id,
                    name,
                    icon: iconId,
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
        if (!open)
            return;

        setName(brand?.name ?? "");
        setIcon(undefined);
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
                            <Input id="brandName" name="name" maxLength={35} placeholder={brand?.name ?? "Required"} disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="brandIcon">Icon</Label>
                            <div className="flex gap-2">
                                <Input id="brandIcon" name="icon" type="file" disabled={isSaving} accept="image/*,.svg" onChange={e => setIcon(e.target.files?.[0] ?? null)} />
                                {brand?.icon && (
                                    <Button variant="outline" size="icon" disabled={isSaving || icon === null} onClick={() => setIcon(null)}>
                                        <IconTrash className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit" className="sm:w-31" disabled={isSaving || !name}>
                            {!isSaving ? "Save changes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}