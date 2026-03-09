import bridge from "@/data/bridge";
import type { Doc } from "@db/dataModel";

export type Sneaker = Awaited<ReturnType<typeof bridge.sneakers.get>>[number];

export interface Search {
    term: string;
    location?: Doc<"sneakers">["location"];
    brand?: Doc<"sneakers">["brand"];
    owner?: Doc<"sneakers">["owner"];
    decommissioned?: Doc<"sneakers">["decommissioned"];
}