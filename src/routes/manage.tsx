import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconCheck, IconLogout, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddBrandDialog } from "@/components/overlays/AddBrandDialog";
import { AddLocationDialog } from "@/components/overlays/AddLocationDialog";
import { AddUserDialog } from "@/components/overlays/AddUserDialog";
import { DeleteBrandDialog } from "@/components/overlays/DeleteBrandDialog";
import { DeleteLocationDialog } from "@/components/overlays/DeleteLocationDialog";
import { DeleteUserDialog } from "@/components/overlays/DeleteUserDialog";
import { Header } from "@/components/Header";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { useLogout } from "@/lib/useLogout";

export const Route = createFileRoute("/manage")({
    component: ManagePage,
});

function ManagePage() {
    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
    const [addLocationDialogOpen, setAddLocationDialogOpen] = useState(false);
    const [addBrandDialogOpen, setAddBrandDialogOpen] = useState(false);
    const { isPending: uip, data: users } = useQuery({
        queryKey: ["users"],
        queryFn: bridge.users.get,
    });
    const { isPending: lip, data: locations } = useQuery({
        queryKey: ["locations"],
        queryFn: bridge.locations.get,
    });
    const { isPending: bip, data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: bridge.brands.get,
    });
    const logout = useLogout();

    return (
        <div className="min-h-screen">
            <Header
                right={
                    <Button variant="outline" size="icon" onClick={logout}>
                        <IconLogout className="size-4.5" />
                    </Button>
                }
            />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-20">
                <Tabs defaultValue="users" className="gap-4">
                    <div className="w-full flex justify-between">
                        <TabsList variant="line">
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="locations">Locations</TabsTrigger>
                            <TabsTrigger value="brands">Brands</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            {(uip || lip || bip) && (
                                <div className="size-9 flex justify-center items-center rounded-md ring-1 ring-input">
                                    <Spinner />
                                </div>
                            )}
                            <TabsContent value="users">
                                <Button onClick={() => setAddUserDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add user
                                </Button>
                                <AddUserDialog open={addUserDialogOpen} setOpen={setAddUserDialogOpen} />
                            </TabsContent>
                            <TabsContent value="locations">
                                <Button onClick={() => setAddLocationDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add location
                                </Button>
                                <AddLocationDialog open={addLocationDialogOpen} setOpen={setAddLocationDialogOpen} />
                            </TabsContent>
                            <TabsContent value="brands">
                                <Button onClick={() => setAddBrandDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add brand
                                </Button>
                                <AddBrandDialog open={addBrandDialogOpen} setOpen={setAddBrandDialogOpen} />
                            </TabsContent>
                        </div>
                    </div>
                    <TabsContent value="users">
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
                    </TabsContent>
                    <TabsContent value="locations">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(locations ?? []).map(l => <LocationTableRow key={l._id} location={l} />)}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="brands">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="lg:w-9" />
                                    <TableHead>Name</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(brands ?? []).map(b => <BrandTableRow key={b._id} brand={b} />)}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function UserTableRow({ user }: { user: Awaited<ReturnType<typeof bridge.users.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { data: session } = useQuery({
        queryKey: ["session"],
        queryFn: checkAuth,
    });

    const isCurrentUser = session?.username === user.username;

    return (
        <TableRow className="h-10">
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.color}</TableCell>
            <TableCell>{user.active && <IconCheck size={20} />}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                {!isCurrentUser && (
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                        <IconTrash />
                    </Button>
                )}
                <AddUserDialog open={editDialogOpen} setOpen={setEditDialogOpen} user={user} isCurrentUser={isCurrentUser} />
                <DeleteUserDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={user._id} />
            </TableCell>
        </TableRow>
    );
}

function LocationTableRow({ location }: { location: Awaited<ReturnType<typeof bridge.locations.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <TableRow className="h-10">
            <TableCell>{location.name}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                    <IconTrash />
                </Button>
                <AddLocationDialog open={editDialogOpen} setOpen={setEditDialogOpen} location={location} />
                <DeleteLocationDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={location._id} />
            </TableCell>
        </TableRow>
    );
}

function BrandTableRow({ brand }: { brand: Awaited<ReturnType<typeof bridge.brands.get>>[number] }) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <TableRow className="h-10">
            <TableCell className="p-0">
                {brand.iconUrl && <img src={brand.iconUrl} alt={brand.name} className="size-5 object-contain" />}
            </TableCell>
            <TableCell>{brand.name}</TableCell>
            <TableCell className="p-0 text-right">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setEditDialogOpen(true)}>
                    <IconPencil />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => setDeleteDialogOpen(true)}>
                    <IconTrash />
                </Button>
                <AddBrandDialog open={editDialogOpen} setOpen={setEditDialogOpen} brand={brand} />
                <DeleteBrandDialog open={deleteDialogOpen} setOpen={setDeleteDialogOpen} _id={brand._id} />
            </TableCell>
        </TableRow>
    );
}