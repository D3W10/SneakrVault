import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "./session";

const YELLOW_PASSWORD = process.env.YELLOW_PASSWORD;
const BLUE_PASSWORD = process.env.BLUE_PASSWORD;

export const login = createServerFn({ method: "POST" })
    .inputValidator((password: string) => password)
    .handler(async ({ data: password }) => {
        let person: 0 | 1 | undefined;

        if (password === YELLOW_PASSWORD)
            person = 0;
        else if (password === BLUE_PASSWORD)
            person = 1;

        if (person !== undefined) {
            const session = await useAppSession();
            await session.update({ isAuthenticated: true, person });
            return { success: true };
        }
        
        await new Promise(r => setTimeout(r, 500));
        
        return { success: false, error: "Invalid password" };
    });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
    const session = await useAppSession();
    await session.clear();
});

export const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
    const session = await useAppSession();

    return { 
        isAuthenticated: !!session.data.isAuthenticated,
        mine: session.data.person ?? 0,
        other: (session.data.person ?? 0) === 0 ? 1 : 0,
    } as { isAuthenticated: boolean; mine: 0 | 1; other: 0 | 1; };
});