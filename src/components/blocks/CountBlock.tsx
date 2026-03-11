import { useQuery } from "@tanstack/react-query";
import bridge from "@/data/bridge";
import { hasSearched } from "@/lib/utils";
import type { Search } from "@/lib/models";

interface CountBlockProps {
    search: Search;
    includeDecommissioned?: boolean;
}

export function CountBlock({ search, includeDecommissioned }: CountBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
    });
    const searched = hasSearched(search);
    const length = (sneakers ?? []).filter(s => includeDecommissioned || !s.decommissioned).length;

    if (!searched)
        return (
            <div className="px-6 md:px-8 flex flex-col gap-4">
                {length !== 0 && <p className="font-medium text-center text-muted-foreground">{length} {length === 1 ? "sneaker" : "sneakers"} total</p>}
            </div>
        );
}