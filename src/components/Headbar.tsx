import { useEffect, useState } from "react";

export function Headbar({ children }: { children: React.ReactNode }) {
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
        <div className={`w-full sticky top-0 ring ${!scrolling ? "bg-background ring-transparent" : "bg-secondary ring-border/50"} z-10 transition duration-300`}>
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl text-transparent font-bold bg-linear-to-r/oklch from-cyan-500 from-10% via-primary via-50% to-amber-500 to-90% bg-clip-text tracking-tight">SneakLookup</h1>
                {children}
            </div>
        </div>
    );
}