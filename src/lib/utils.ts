import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Search, Sneaker } from "@/lib/models";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function hasSearched(search: Search) {
    return search.term.length > 0 || search.location || search.brand || search.owner || search.type || search.decommissioned !== undefined;
}

export function filterBySearch(sneakers: Sneaker[], search: Search) {
    return sneakers.filter(sneaker =>
        sneaker.name.toLowerCase().includes(search.term.toLowerCase()) &&
        (!search.location || sneaker.location._id === search.location) &&
        (!search.brand || sneaker.brand._id === search.brand) &&
        (!search.owner || sneaker.owner === search.owner) &&
        (!search.type || sneaker.type === search.type) &&
        (search.decommissioned === undefined ? !sneaker.decommissioned : search.decommissioned ? sneaker.decommissioned : true)
    );
}