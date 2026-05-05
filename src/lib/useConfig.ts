import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import bridge from "@/data/bridge";
import type { DataModel } from "@db/dataModel";

type Config = Omit<DataModel["configs"]["document"], "_id" | "_creationTime">;

export function useConfig() {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const { isPending, data } = useQuery({
        queryKey: ["configs"],
        queryFn: bridge.configs.get,
    });
    const queryClient = useQueryClient();
    const updateConfig = useMutation({
        mutationFn: (config: Config) => {
            setConfig(config);
            return bridge.configs.edit({ data: config });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configs"] }),
    });

    useEffect(() => {
        if (data) setConfig({ ...defaultConfig, ...data });
    }, [data]);

    return { isPending, config, updateConfig };
}

const defaultConfig = {
    cardSecondaryInfo: "location",
    cardShowOwnerColor: true,
    defaultTypeFilter: "all",
    defaultShowDecommissioned: false,
    enableSneakPick: true,
    homePageSections: ["SneakPick", "Birthday", "Grid", "Count"],
    publicPage: false,
    locationVisibility: "protected",
    descriptionVisibility: "protected",
    originalOwnerVisibility: "protected",
} satisfies Config;
