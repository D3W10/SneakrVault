import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
    children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
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
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <h1 className="text-3xl text-primary font-extrabold tracking-tight drop-shadow-lg drop-shadow-primary/40">SneakrVault</h1>
                <div className="flex gap-2">
                    {children}
                </div>
            </div>
        </div>
    );
}