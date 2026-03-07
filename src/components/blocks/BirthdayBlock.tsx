import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { IconCake } from "@tabler/icons-react";
import { SneakerCard } from "@/components/SneakerCard";
import { getSneakers } from "@/data/bridge";
import { hasSearched } from "@/lib/utils";
import type { Search } from "@/lib/models";

interface BirthdayBlockProps {
    search: Search;
}

export function BirthdayBlock({ search }: BirthdayBlockProps) {
    const { data: sneakers } = useQuery({
        queryKey: ["sneakers"],
        queryFn: getSneakers,
    });

    const today = moment().startOf("day");
    const nextWeek = moment().add(7, "days").endOf("day");
    const upcomingBirthdays = (sneakers ?? []).filter(s => {
        const birthdayDate = moment(s.date);
        const currentYearBirthday = birthdayDate.clone().year(today.year());

        if (currentYearBirthday.isBefore(today, "day"))
            currentYearBirthday.add(1, "year");

        return currentYearBirthday.isBetween(today, nextWeek, "day", "[]");
    }).sort((a, b) => {
        const bdayA = moment(a.date).year(today.year());
        if (bdayA.isBefore(today, "day")) bdayA.add(1, "year");

        const bdayB = moment(b.date).year(today.year());
        if (bdayB.isBefore(today, "day")) bdayB.add(1, "year");

        return bdayA.diff(bdayB);
    });

    if (!hasSearched(search) && upcomingBirthdays.length !== 0) {
        return (
            <div className="px-6 md:px-8 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <IconCake className="size-5 text-primary" />
                    <h2 className="text-xl font-bold text-white">Upcoming Birthdays</h2>
                </div>
                <div className="p-px pb-4 flex gap-4 overflow-x-auto">
                    {upcomingBirthdays.map(s => (
                        <SneakerCard 
                            key={s._id} 
                            sneaker={s} 
                            birthday 
                        />
                    ))}
                </div>
            </div>
        );
    }
}