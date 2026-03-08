import type { getSneakers } from "@/data/bridge";
import type { Doc } from "@db/dataModel";

export type Sneaker = Awaited<ReturnType<typeof getSneakers>>[number];

export interface Search {
    term: string;
    location?: Doc<"sneakers">["location"];
    brand?: Doc<"sneakers">["brand"];
    owner?: Doc<"sneakers">["owner"];
    decommissioned?: Doc<"sneakers">["decommissioned"];
}