import { useSession } from "@tanstack/react-start/server";

export type SessionState = {
    isAuthenticated: boolean;
    person?: 0 | 1;
};

export function useAppSession() {
    return useSession<SessionState>({
        name: "sneaklookup_auth",
        password: process.env.SESSION_SECRET || process.env.VITE_SESSION_SECRET || "59f4e094b8444f84954ecb2bde5e184a",
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/",
        },
    });
}