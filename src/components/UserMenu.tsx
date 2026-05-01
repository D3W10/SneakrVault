import { useNavigate } from "@tanstack/react-router";
import { IconDots, IconLogin, IconLogout, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SessionState } from "@/data/session";

interface UserMenuProps {
    auth: Partial<SessionState>;
    logout: () => void;
}

export function UserMenu({ auth, logout }: UserMenuProps) {
    const navigate = useNavigate();

    if (!auth.isAuthenticated)
        return (
            <Button variant="outline" size="icon" onClick={() => navigate({ to: "/login" })}>
                <IconLogin className="size-5" />
            </Button>
        );

    if (auth.role === "admin")
        return (
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                    <IconDots className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                    {auth.role === "admin" && (
                        <DropdownMenuItem onClick={() => navigate({ to: "/manage" })}>
                            <IconSettings className="size-4" />
                            Settings
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive" onClick={logout}>
                        <IconLogout className="size-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    else
        return (
            <Button variant="outline" size="icon" onClick={logout}>
                <IconLogout className="size-5" />
            </Button>
        );
}
