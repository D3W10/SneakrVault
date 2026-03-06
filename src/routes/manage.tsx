import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconLogout, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddUserDialog } from "@/components/AddUserDialog";
import { DeleteUserDialog } from "@/components/DeleteUserDialog";
import { Header } from "@/components/Header";
import { checkAuth, logout } from "@/data/auth";
import { getUsers } from "@/data/bridge";
import type { Doc } from "@db/dataModel";

export const Route = createFileRoute("/manage")({
    component: ManagePage,
});

function ManagePage() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { isPending, data: users } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });
    const queryClient = useQueryClient();

    function handleLogout() {
        logout();
        queryClient.invalidateQueries({ queryKey: ["session"] });
        navigate({ to: "/login" });
    }

    return (
        <div className="min-h-screen">
            <Header
                right={
                    <Button variant="ghost" size="icon-lg" className="text-muted-foreground" onClick={handleLogout}>
                        <IconLogout className="size-4.5" />
                    </Button>
                }
            />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-20 flex flex-col items-end gap-4">
                <div className="flex gap-2">
                    {isPending && (
                        <div className="size-9 flex justify-center items-center rounded-md ring-1 ring-input">
                            <Spinner />
                        </div>
                    )}
                    <Button onClick={() => setAddDialogOpen(true)}>
                        <IconPlus className="size-4" data-icon="inline-start" />
                        Add user
                    </Button>
                    <AddUserDialog open={addDialogOpen} setOpen={setAddDialogOpen} />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead className="lg:w-36">Role</TableHead>
                            <TableHead className="lg:w-56">Color</TableHead>
                            <TableHead className="lg:w-24">Active</TableHead>
                            <TableHead className="lg:w-20" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(users ?? []).map(u => <UserTableRow key={u._id} user={u} />)}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function UserTableRow({ user }: { user: Doc<"users"> }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { data: session } = useQuery({
        queryKey: ["session"],
        queryFn: checkAuth,
    });

    return (
        <TableRow>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.color}</TableCell>
            <TableCell>{user.active && <IconCheck size={20} />}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                {session && user.username !== session.username && (
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                        <IconTrash />
                    </Button>
                )}
                <AddUserDialog open={editDialogOpen} setOpen={setEditDialogOpen} user={user} />
                <DeleteUserDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} username={user.username} />
            </TableCell>
        </TableRow>
    );
}