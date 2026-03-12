import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconHexagon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import bridge from "@/data/bridge";
import { useOutsideClick } from "@/lib/useOutsideClick";
import { cn } from "@/lib/utils";
import type { SessionState } from "@/data/session";
import type { Sneaker } from "@/lib/models";

interface SneakPickSelectorProps {
    sneaker: Sneaker | undefined;
    auth?: Partial<SessionState>;
}

export function SneakPickSelector({ sneaker, auth }: SneakPickSelectorProps) {
    if (!sneaker)
        return <Skeleton className="w-86 h-52 rounded-xl" />;

    return (
        <div className="w-86 h-fit p-4 bg-accent rounded-xl ring ring-border space-y-3">
            <div className="flex items-center gap-2">
                <IconHexagon className="size-4 text-primary" />
                <h3 className="font-bold">Pick this sneaker</h3>
            </div>
            <div className="space-y-2">
                <PickTimeSelect auth={auth} self />
                <PickTimeSelect auth={auth} />
            </div>
        </div>
    );
}

interface PickTimeSelectProps {
    auth?: Partial<SessionState>;
    self?: boolean;
}

function PickTimeSelect({ auth, self = false }: PickTimeSelectProps) {
    const [open, setOpen] = useState(false);
    const [pickFor, setPickFor] = useState<string | null>(null);
    const { data: users } = useQuery({
        queryKey: ["owners"],
        queryFn: bridge.users.getOwners,
        enabled: !self,
        select: users => users.filter(u => u.active && u._id !== auth?._id),
    });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pickFor && users?.length) setPickFor(users[0]._id);
    }, [users]);
    useOutsideClick(ref, () => setOpen(false));

    const selUser = users?.find(o => o._id === pickFor);

    return (
        <div ref={ref} className="min-h-9 relative">
            <Button className="w-full relative z-2" variant={self ? "default" : "outline"} onClick={() => setOpen(!open)}>{self ? "Pick for me" : "Pick for someone else"}</Button>
            <div className="h-5 absolute top-4 -left-px -right-px bg-accent rounded-b-md z-1" />
            <div className={cn("mx-px -mt-4 mb-px px-1 relative rounded-md ring ring-border overflow-hidden space-y-0.5 transition-all duration-300", !open ? "h-0 ease-in-out" : (self ? "h-43.5" : "h-53") + " pt-5 pb-1 ease-out")}>
                {!self && (
                    <Select value={pickFor} onValueChange={e => setPickFor(e)}>
                        <SelectTrigger className="w-full">
                            {!selUser ? "Select a user" : (
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: selUser?.color }} />
                                    {selUser.username}
                                </div>
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {(users ?? []).map(u => (
                                <SelectItem value={u._id} key={u._id}>
                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: u.color }} />
                                    {u.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!users?.length}>For 1 hour</Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!users?.length}>For 3 hour</Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!users?.length}>For 8 hour</Button>
                <Button className="w-full px-2 flex justify-start" variant="ghost" disabled={!users?.length}>Until tomorrow</Button>
            </div>
        </div>
    );
}