import { createServerFn } from "@tanstack/react-start";
import moment from "moment";
import { supabase } from "./supabaseClient";
import { checkAuth } from "./auth";

export interface Sneaker {
    id: string;
    name: string;
    color: string;
    date: Date;
    photo?: string;
    location: string;
    owner?: string;
    original_owner?: string;
    brand: string;
    decommissioned: boolean;
    pick_date?: Date;
    pick_to?: string;
    stockx_url?: string;
}

const DATE_FORMAT = "YYYY-MM-DD";

const parseSneaker = (sneaker: any): Sneaker => ({
    ...sneaker,
    photo: sneaker.photo ? process.env.SUPABASE_URL + "/storage/v1/object/public/photos/" + sneaker.photo + ".webp" : undefined,
    date: moment(sneaker.date, DATE_FORMAT).toDate(),
    pick_date: sneaker.pick_date ? moment(sneaker.pick_date, DATE_FORMAT).toDate() : undefined,
});

async function ensureAuth() {
    const { isAuthenticated } = await checkAuth();

    if (!isAuthenticated)
        throw new Error("Unauthorized");
}

export const getSneakers = createServerFn({ method: "GET" }).handler(
    async (): Promise<Sneaker[]> => {
        await ensureAuth();
        const { data, error } = await supabase
            .from("sneakers")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching sneakers:", error);
            return [];
        }

        return data.map(parseSneaker);
    }
);

export const getSneaker = createServerFn({ method: "GET" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }: { data: string }): Promise<Sneaker | undefined> => {
        await ensureAuth();
        const { data, error } = await supabase
            .from("sneakers")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching sneaker:", error);
            return;
        }

        return parseSneaker(data);
    });

export const getPersons = createServerFn({ method: "GET" }).handler(
    async (): Promise<string[]> => {
        await ensureAuth();
        const { data, error } = await supabase.rpc("get_person_enum");

        if (error) {
            console.error("Error fetching persons:", error);
            return [];
        }

        return data;
    }
);

export const getLocations = createServerFn({ method: "GET" }).handler(
    async (): Promise<string[]> => {
        await ensureAuth();
        const { data, error } = await supabase.rpc("get_location_enum");

        if (error) {
            console.error("Error fetching locations:", error);
            return [];
        }

        return data;
    }
);

export const updatePick = createServerFn({ method: "POST" })
    .inputValidator((data: { personId: string; sneakerId: string }) => data)
    .handler(
        async ({ data }: { data: { personId: string; sneakerId: string } }): Promise<void> => {
            await ensureAuth();
            const { error } = await supabase
                .from("sneakers")
                .update({ pick_date: null, pick_to: null })
                .eq("pick_to", data.personId);

            const { error: error2 } = await supabase
                .from("sneakers")
                .update({ pick_date: moment().format(DATE_FORMAT), pick_to: data.personId })
                .eq("id", data.sneakerId);

            if (error || error2) {
                console.error("Error updating sneaker location:", error || error2);
                throw error || error2;
            }
        }
    );

export const updateSneakerLocation = createServerFn({ method: "POST" })
    .inputValidator((data: { sneakerId: string; location: string }) => data)
    .handler(
        async ({ data }: { data: { sneakerId: string; location: string } }): Promise<void> => {
            await ensureAuth();
            const { error } = await supabase
                .from("sneakers")
                .update({ location: data.location })
                .eq("id", data.sneakerId);

            if (error) {
                console.error("Error updating sneaker location:", error);
                throw error;
            }
        }
    );