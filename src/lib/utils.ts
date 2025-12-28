import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function authIf(id: number, i1: string, i2: string) {
    return id === 0 ? i1 : id === 1 ? i2 : "";
}