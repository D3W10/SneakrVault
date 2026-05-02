import { useQuery } from "@tanstack/react-query";
import bridge from "@/data/bridge";
import { filterBySearch, hasSearched } from "@/lib/utils";
import type { Search } from "@/lib/models";

interface CountBlockProps {
    search: Search;
    hideOnSearch?: boolean;
}

export function CountBlock({ search, hideOnSearch }: CountBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: bridge.sneakers.get,
    });
    const searched = hasSearched(search);
    const length = filterBySearch(sneakers ?? [], search).length;

    if (hideOnSearch && searched) return null;

    return (
        <div className="px-6 md:px-8 flex flex-col gap-4">
            {length !== 0 && <p className="font-medium text-center text-muted-foreground">{length} {!searched ? `${length === 1 ? "sneaker" : "sneakers"} total` : `search ${length === 1 ? "result" : "results"}`}</p>}
        </div>
    );
}