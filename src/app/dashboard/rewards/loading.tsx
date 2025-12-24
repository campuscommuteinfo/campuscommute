import { Skeleton } from "@/components/ui/skeleton";

export default function RewardsLoading() {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl bg-white/20" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-white/20" />
                        <Skeleton className="h-4 w-24 bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-20" />
            </div>

            {/* Reward Cards */}
            <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* Image */}
                        <Skeleton className="h-32 w-full" />

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
