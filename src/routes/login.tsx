import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/data/auth";

export const Route = createFileRoute("/login")({
    component: LoginComponent,
});

function LoginComponent() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login({ data: password });

            if (result.success) {
                await router.invalidate();
                await router.navigate({ to: "/" });
            } else
                setError(result.error || "Invalid password");
        } catch (err) {
            console.error(err);
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen px-6 flex flex-col justify-center items-center">
            <form className="w-full max-w-sm flex flex-col items-center gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl text-transparent font-bold bg-linear-to-r/oklch from-cyan-500 from-10% via-primary via-50% to-amber-500 to-90% bg-clip-text">SneakLookup</h1>
                    <p className="mt-2 text-center text-sm font-medium text-secondary-foreground">Please enter the password to access the library</p>
                </div>

                <Input
                    type="password"
                    required
                    placeholder="Password"
                    className={"w-full " + (error ? "animate-shake" : "")}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError("")}}
                    aria-invalid={error ? "true" : "false"}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? <Spinner /> : "Enter"}
                </Button>
            </form>
        </div>
    );
}
