import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { MAX_USERNAME_LENGTH, MAX_PASSWORD_LENGTH } from "@/data/auth";
import { addUser, editUser } from "@/data/bridge";
import { useLogout } from "@/lib/useLogout";
import type { Doc } from "@db/dataModel";

interface AddUserDialogProps {
    open: boolean;
    setOpen: (open: boolean) => unknown;
    user?: Doc<"users">;
    isCurrentUser?: boolean;
}

export function AddUserDialog({ open, setOpen, user, isCurrentUser = false }: AddUserDialogProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Doc<"users">["role"]>("guest");
    const [color, setColor] = useState("");
    const [isColorValid, setIsColorValid] = useState(false);
    const [active, setActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>();
    const logout = useLogout();
    const queryClient = useQueryClient();

    function validateColor(color: string) {
        document.head.style.color = color;
        const isValid = document.head.style.color;
        document.head.removeAttribute("style");
    
        return !!isValid;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        if (!user) {
            const result = await addUser({
                data: {
                    username,
                    password,
                    role,
                    color,
                    active,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        } else {
            const result = await editUser({
                data: {
                    _id: user._id,
                    username,
                    password,
                    role,
                    color,
                    active,
                },
            });
            if (!result.success) {
                setError(result.error);
                setIsSaving(false);
                return;
            }
        }

        await queryClient.invalidateQueries({ queryKey: ["users"] });

        if (isCurrentUser) {
            logout();
            return
        }

        setOpen(false);
        setIsSaving(false);
    }

    useEffect(() => {
        setIsColorValid(validateColor(color));
    }, [color]);

    useEffect(() => {
        if (!open)
            return;

        setUsername(user?.username ?? "");
        setPassword("");
        setRole(user?.role ?? "guest");
        setColor(user?.color ?? "");
        setActive(user?.active ?? true);
        setError("");
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false}>
                <form className="contents" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{!user ? "Add user" : "Edit user"}</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="userUsername">Username</Label>
                            <Input id="userUsername" name="username" maxLength={MAX_USERNAME_LENGTH} placeholder={user?.username ?? "Required"} value={username} onChange={e => setUsername(e.target.value)} />
                        </Field>
                        <Field>
                            <Label htmlFor="userPassword">Password</Label>
                            <Input id="userPassword" name="password" type="password" maxLength={MAX_PASSWORD_LENGTH} placeholder={!user ? "Required" : "New password"} value={password} onChange={e => setPassword(e.target.value)} />
                        </Field>
                        <div className="flex gap-2">
                            <Field className="flex-2">
                                <Label htmlFor="userRole">Role</Label>
                                <Select value={role} disabled={isCurrentUser} onValueChange={e => setRole(e ?? "guest")}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guest">guest</SelectItem>
                                        <SelectItem value="normal">normal</SelectItem>
                                        <SelectItem value="admin">admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field className="flex-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="userColor">Color</Label>
                                    {isColorValid && <div className="w-5 h-2.5 mr-0.5 rounded-md" style={{ backgroundColor: color }} />}
                                </div>
                                <Input id="userColor" name="color" placeholder="#ff566b" value={color} onChange={e => setColor(e.target.value)} />
                            </Field>
                        </div>
                        <Field orientation="horizontal" className="w-fit">
                            <Checkbox id="userActive" checked={active} disabled={isCurrentUser} onCheckedChange={e => setActive(!!e)} />
                            <FieldLabel htmlFor="userActive">Active</FieldLabel>
                        </Field>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit" className="w-31" disabled={isSaving || !username || !role || !color || !isColorValid || !user && !password}>
                            {!isSaving ? "Save changes" : <Spinner />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}