import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import colors from "tailwindcss/colors";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import bridge from "@/data/bridge";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/models";

interface AddCollectionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    collection?: Collection;
}

export function AddCollectionDialog(props: AddCollectionDialogProps) {
    const { open, ...rest } = props;

    return (
        <Dialog open={open} onOpenChange={rest.setOpen}>
            <DialogContent showCloseButton={false}>
                {open && <AddCollectionDialogContent {...rest} />}
            </DialogContent>
        </Dialog>
    );
}

function AddCollectionDialogContent({ setOpen, collection }: Omit<AddCollectionDialogProps, "open">) {
    const [name, setName] = useState(collection?.name ?? "");
    const [cover, setCover] = useState(collection?.cover ?? []);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!collection) {
            const result = await bridge.collections.add({
                data: { name, cover, sneakers: [] },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await bridge.collections.edit({
                data: {
                    _id: collection._id,
                    name,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["collections"] });

        setOpen(false);
        setIsSaving(false);
    }

    return (
        <form className="contents" onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{!collection ? "Add collection" : "Edit collection"}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <Label htmlFor="collectionName">Name</Label>
                    <Input id="collectionName" name="name" maxLength={40} placeholder="Paris Trip" disabled={isSaving} value={name} onChange={e => setName(e.target.value)} />
                </Field>
                <Field>
                    <Label htmlFor="collectionCover">Cover</Label>
                    <div className="flex gap-2">
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-red-400 to-rose-700 border-2 border-red-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.red[400] && "inset-ring-background")} onClick={() => setCover([colors.red[400], colors.rose[700]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-orange-400 to-orange-700 border-2 border-orange-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.orange[400] && "inset-ring-background")} onClick={() => setCover([colors.orange[400], colors.orange[700]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-amber-400 to-orange-500 border-2 border-amber-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.amber[400] && "inset-ring-background")} onClick={() => setCover([colors.amber[400], colors.orange[500]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-lime-400 to-green-700 border-2 border-lime-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.lime[400] && "inset-ring-background")} onClick={() => setCover([colors.lime[400], colors.green[700]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-emerald-400 to-teal-700 border-2 border-emerald-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.emerald[400] && "inset-ring-background")} onClick={() => setCover([colors.emerald[400], colors.teal[700]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-sky-400 to-blue-700 border-2 border-sky-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.sky[400] && "inset-ring-background")} onClick={() => setCover([colors.sky[400], colors.blue[700]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-indigo-500 to-indigo-800 border-2 border-indigo-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.indigo[500] && "inset-ring-background")} onClick={() => setCover([colors.indigo[500], colors.indigo[800]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-purple-500 to-violet-800 border-2 border-purple-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.purple[500] && "inset-ring-background")} onClick={() => setCover([colors.purple[500], colors.violet[800]])} />
                        <Button className={cn("h-5 p-0 flex-1 bg-linear-to-r from-rose-400 to-pink-700 border-2 border-rose-400 rounded-sm inset-ring-2 inset-ring-transparent cursor-pointer", cover[0] === colors.rose[400] && "inset-ring-background")} onClick={() => setCover([colors.rose[400], colors.pink[700]])} />
                    </div>
                </Field>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
            <DialogFooter>
                <DialogClose disabled={isSaving} render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" className="sm:w-31" disabled={isSaving || !name || !cover.length}>
                    {!isSaving ? "Save changes" : <Spinner />}
                </Button>
            </DialogFooter>
        </form>
    );
}