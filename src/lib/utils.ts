import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Search, Sneaker } from "@/lib/models";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function hasSearched(search: Search) {
    return search.term.length > 0 || search.location || search.brand || search.owner || search.decommissioned !== undefined;
}

export function filterBySearch(sneakers: Sneaker[], search: Search) {
    return sneakers.filter(sneaker => 
        sneaker.name.toLowerCase().includes(search.term.toLowerCase()) &&
        (!search.location || sneaker.location === search.location) &&
        (!search.brand || sneaker.brand.name === search.brand) &&
        (!search.owner || sneaker.owner === search.owner) &&
        (!search.decommissioned && !sneaker.decommissioned)
    );
}