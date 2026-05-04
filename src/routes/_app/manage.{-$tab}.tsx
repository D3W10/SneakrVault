import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconCheck, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AddBrandDialog } from "@/components/overlays/AddBrandDialog";
import { AddLocationDialog } from "@/components/overlays/AddLocationDialog";
import { AddUserDialog } from "@/components/overlays/AddUserDialog";
import { DeleteBrandDialog } from "@/components/overlays/DeleteBrandDialog";
import { DeleteLocationDialog } from "@/components/overlays/DeleteLocationDialog";
import { DeleteUserDialog } from "@/components/overlays/DeleteUserDialog";
import { Header } from "@/components/Header";
import { UserMenu } from "@/components/UserMenu";
import { checkAuth } from "@/data/auth";
import bridge from "@/data/bridge";
import { useConfig } from "@/lib/useConfig";
import { useLogout } from "@/lib/useLogout";
import { cn } from "@/lib/utils";
import type { DataModel } from "@db/dataModel";

export const Route = createFileRoute("/_app/manage/{-$tab}")({
    component: ManagePage,
    beforeLoad: () => checkAuth(),
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
    const { isPending: cip, config, updateConfig } = useConfig();
    const { tab } = Route.useParams();
    const navigate = useNavigate();
    const { auth } = Route.useRouteContext();
    const logout = useLogout();
    const tabs = ["users", "locations", "brands", "configurations"] as const;
    const activeTab = tabs.includes(tab as (typeof tabs)[number]) ? tab : tabs[0];
    function changePageSecurity(publicPage: boolean) {
        const patch = { ...config, publicPage };
        const derivateKeys = ["locationVisibility", "descriptionVisibility", "originalOwnerVisibility"] as const;

        derivateKeys.forEach(key => {
            if (patch[key] === "public" && !publicPage)
                patch[key] = "protected";
        });

        updateConfig.mutate(patch);
    }

    return (
        <div className="min-h-screen">
            <Header
                right={
                    <UserMenu auth={auth} logout={logout} />
                }
            />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4 pb-20">
                <Tabs className="gap-4" value={activeTab} onValueChange={value => navigate({ to: "/manage/{-$tab}", params: { tab: value } })}>
                    <div className="w-full flex justify-between">
                        <TabsList variant="line" className="pr-4 justify-start overflow-x-auto overflow-y-hidden scrollbar-hidden">
                            <TabsTrigger value={tabs[0]}>Users</TabsTrigger>
                            <TabsTrigger value={tabs[1]}>Locations</TabsTrigger>
                            <TabsTrigger value={tabs[2]}>Brands</TabsTrigger>
                            <TabsTrigger value={tabs[3]}>Configurations</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            {(uip || lip || bip || cip) && (
                                <div className="size-9 flex justify-center items-center rounded-md ring-1 ring-input">
                                    <Spinner />
                                </div>
                            )}
                            <TabsContent value={tabs[0]}>
                                <Button className="max-sm:hidden" onClick={() => setAddUserDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add user
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddUserDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddUserDialog open={addUserDialogOpen} setOpen={setAddUserDialogOpen} />
                            </TabsContent>
                            <TabsContent value={tabs[1]}>
                                <Button className="max-sm:hidden" onClick={() => setAddLocationDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add location
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddLocationDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddLocationDialog open={addLocationDialogOpen} setOpen={setAddLocationDialogOpen} />
                            </TabsContent>
                            <TabsContent value={tabs[2]}>
                                <Button className="max-sm:hidden" onClick={() => setAddBrandDialogOpen(true)}>
                                    <IconPlus className="size-4" data-icon="inline-start" />
                                    Add brand
                                </Button>
                                <Button className="sm:hidden" size="icon" onClick={() => setAddBrandDialogOpen(true)}>
                                    <IconPlus className="size-4" />
                                </Button>
                                <AddBrandDialog open={addBrandDialogOpen} setOpen={setAddBrandDialogOpen} />
                            </TabsContent>
                        </div>
                    </div>
                    <TabsContent value={tabs[0]}>
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
                    <TabsContent value={tabs[1]}>
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
                    <TabsContent value={tabs[2]}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-9" />
                                    <TableHead>Name</TableHead>
                                    <TableHead className="lg:w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(brands ?? []).map(b => <BrandTableRow key={b._id} brand={b} />)}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value={tabs[3]}>
                        {!cip && (
                            <>
                                <ConfigSection title="Personalization">
                                </ConfigSection>
                                <hr />
                                <ConfigSection title="Security">
                                    <ConfigItem
                                        title="Public page"
                                        description="Allow anyone to view your sneaker collection without the need to log in. This will also allow them to see information about the pairs!"
                                    >
                                        <Switch
                                            checked={config.publicPage}
                                            onCheckedChange={changePageSecurity}
                                        />
                                    </ConfigItem>
                                    <ConfigItem
                                        title="Location visibility"
                                        description="Allow anyone to view the location of your pairs without the need to log in. Proceed with caution!"
                                        wrap
                                    >
                                        <VisibilitySelect
                                            value={config.locationVisibility}
                                            onChange={v => updateConfig.mutate({ ...config, locationVisibility: v })}
                                        />
                                    </ConfigItem>
                                    <ConfigItem
                                        title="Description visibility"
                                        description="Allow anyone to view the descriptions of your pairs without the need to log in."
                                        wrap
                                    >
                                        <VisibilitySelect
                                            value={config.descriptionVisibility}
                                            onChange={v => updateConfig.mutate({ ...config, descriptionVisibility: v })}
                                        />
                                    </ConfigItem>
                                    <ConfigItem
                                        title="Original Owner visibility"
                                        description="Allow anyone to view the original owner of your pairs without the need to log in."
                                        wrap
                                    >
                                        <VisibilitySelect
                                            value={config.originalOwnerVisibility}
                                            onChange={v => updateConfig.mutate({ ...config, originalOwnerVisibility: v })}
                                        />
                                    </ConfigItem>
                                </ConfigSection>
                            </>
                        )}
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

function ConfigSection({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="my-6">
            <h2 className="text-2xl md:text-3xl text-transparent font-black bg-linear-to-b from-zinc-50 to-zinc-600 bg-clip-text tracking-tight">{title}</h2>
            {children}
        </div>
    );
}

function ConfigItem({ title, description, children, wrap = false }: { title: string; description?: string; children?: React.ReactNode; wrap?: boolean }) {
    return (
        <div className={cn("mt-5 flex", !wrap ? "gap-6" : "max-sm:flex-col gap-1.5 sm:gap-6")}>
            <div className="flex-1 space-y-1">
                <h3 className="text-sm sm:text-base text-secondary-foreground font-bold">{title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="pt-1.5 pr-2">
                {children}
            </div>
        </div>
    );
}

function VisibilitySelect({ value, onChange }: { value: DataModel["configs"]["document"]["locationVisibility"]; onChange: (value: DataModel["configs"]["document"]["locationVisibility"]) => unknown }) {
    const { config } = useConfig();
    
    const visibilityMap: Record<DataModel["configs"]["document"]["locationVisibility"], string> = {
        protected: "Only for members",
        guests: "Guests and members",
        public: "Public",
    };

    return (
        <Select value={value} onValueChange={v => onChange(v as keyof typeof visibilityMap)}>
            <SelectTrigger className="w-full sm:w-52">
                {visibilityMap[value]}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="protected">{visibilityMap.protected}</SelectItem>
                <SelectItem value="guests">{visibilityMap.guests}</SelectItem>
                {config.publicPage && <SelectItem value="public">{visibilityMap.public}</SelectItem>}
            </SelectContent>
        </Select>
    );
}
