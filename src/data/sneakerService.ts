import { createServerFn } from "@tanstack/react-start";
import { db } from "./firebaseAdmin";

export interface Location {
    id: string;
    name: string;
}

export interface Sneaker {
    id: string;
    name: string;
    color: string;
    location: string;
    photo?: string;
    date?: string;
}

const SNEAKERS_COLLECTION = "sneakers";
const LOCATIONS_COLLECTION = "locations";

export const getSneakers = createServerFn({ method: "GET" }).handler(
    async (): Promise<Sneaker[]> => {
        try {
            const snapshot = await db
                .collection(SNEAKERS_COLLECTION)
                .orderBy("date", "desc")
                .get();

            if (snapshot.empty)
                return [];

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate?.()?.toISOString() || data.date
                } as Sneaker;
            });
        } catch (error) {
            console.error("Error fetching sneakers:", error);
            return [];
        }
    }
);

export const getSneaker = createServerFn({ method: "GET" })
    .inputValidator((id: string) => id)
    .handler(async ({ data }: { data: string }): Promise<Sneaker | undefined> => {
        try {
            const docRef = db.collection(SNEAKERS_COLLECTION).doc(data);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    ...docData,
                    date: docData?.date?.toDate?.()?.toISOString() || docData?.date
                } as Sneaker;
            }

            return;
        } catch (error) {
            console.error("Error fetching sneaker:", error);
            return;
        }
    });

export const getLocations = createServerFn({ method: "GET" }).handler(
    async (): Promise<Location[]> => {
        try {
            const snapshot = await db
                .collection(LOCATIONS_COLLECTION)
                .orderBy("name")
                .get();

            if (snapshot.empty)
                return [];

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
        } catch (error) {
            console.error("Error fetching locations:", error);
            return [];
        }
    }
);

export const updateSneakerLocation = createServerFn({ method: "POST" })
    .inputValidator((data: { sneakerId: string; location: string }) => data)
    .handler(
        async ({ data }: { data: { sneakerId: string; location: string } }): Promise<void> => {
            try {
                const sneakerRef = db.collection(SNEAKERS_COLLECTION).doc(data.sneakerId);
                await sneakerRef.update({ location: data.location });
            } catch (error) {
                console.error("Error updating sneaker location:", error);
                throw error;
            }
        }
    );