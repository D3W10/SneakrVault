import type { Doc } from "@db/dataModel";

export interface Search {
    term: string;
    location?: Doc<"sneakers">["location"];
    brand?: Doc<"sneakers">["brand"];
    owner?: Doc<"sneakers">["owner"];
    decommissioned?: Doc<"sneakers">["decommissioned"];
}