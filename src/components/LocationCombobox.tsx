import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { Location } from "@/data/sneakerService";

interface LocationComboboxProps {
    locations: Location[];
    value: string;
    onChange: (value: string) => void;
}

export function LocationCombobox({ locations, value, onChange }: LocationComboboxProps) {
    const [open, setOpen] = useState(false);
    const selectedLocation = locations.find((location) => location.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between hover:text-white bg-white/5 hover:bg-white/7 border-white/10"
                >
                    {value ? selectedLocation?.name : "Select location..."}
                    <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-zinc-950 border-zinc-800">
                <Command className="bg-transparent">
                    <CommandList>
                        <CommandEmpty>No locations found</CommandEmpty>
                        <CommandGroup>
                            {locations.map((location) => (
                                <CommandItem
                                    key={location.id}
                                    value={location.name}
                                    onSelect={() => {
                                        onChange(location.id);
                                        setOpen(false);
                                    }}
                                    className="text-zinc-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer"
                                >
                                    {location.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}