import { useQuery } from "@tanstack/react-query";
import { getSneakers } from "@/data/bridge";
import { hasSearched } from "@/lib/utils";
import type { Search } from "@/lib/models";

interface CountBlockProps {
    search: Search;
    includeDecommissioned?: boolean;
}

export function CountBlock({ search }: CountBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: getSneakers,
    });
    const searched = hasSearched(search);

    if (!searched)
        return (
            <div className="px-6 md:px-8 flex flex-col gap-4">
                {(sneakers ?? []).length !== 0 && <p className="font-medium text-center text-muted-foreground">{(sneakers ?? []).length}</p>}
            </div>
        );
}