import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
    left?: React.ReactNode;
    right?: React.ReactNode;
}

export function Header({ left, right }: HeaderProps) {
    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10)
                setScrolling(true);
            else
                setScrolling(false);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className={cn("w-full sticky top-0 ring z-10 transition duration-300", !scrolling ? "bg-background ring-transparent" : "bg-muted ring-border")}>
            <div className="max-w-7xl h-22 mx-auto px-6 md:px-8 py-4 flex justify-between items-center gap-4">
                <div className="max-md:flex hidden gap-2 flex-1">{left}</div>
                <h1 className="text-2xl sm:text-3xl text-primary font-extrabold tracking-tight drop-shadow-lg drop-shadow-primary/40">SneakrVault</h1>
                <div className="flex justify-end gap-2 flex-1">{right}</div>
            </div>
        </div>
    );
}