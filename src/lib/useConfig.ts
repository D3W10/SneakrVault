import { useQuery } from "@tanstack/react-query";
import bridge from "@/data/bridge";
import type { DataModel } from "@db/dataModel";

type Config = Omit<DataModel["configs"]["document"], "_id" | "_creationTime">;

type NativeConfigResult = {
    isPending: boolean;
    data?: Config;
};

type ResolvedConfigResult = Config;

export function useConfig(): ResolvedConfigResult;
export function useConfig(native: true): NativeConfigResult;
export function useConfig(native: false): ResolvedConfigResult;
export function useConfig(native: boolean = false): NativeConfigResult | ResolvedConfigResult {
    const { isPending, data } = useQuery({
        queryKey: ["configs"],
        queryFn: bridge.configs.get,
    });

    if (native) return { isPending, data: { ...defaultConfig, ...data } };

    return data ? { ...defaultConfig, ...data } : defaultConfig;
}

const defaultConfig = {
    publicPage: false,
    showOwnerOnCard: true,
    showLocationOnCard: true,
    enableSneakPick: true,
    homePageSections: ["SneakPick", "Birthday", "Grid", "Count"],
} satisfies Config;
