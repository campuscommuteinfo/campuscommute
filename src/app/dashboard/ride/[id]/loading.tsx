import { Skeleton } from "@/components/ui/skeleton";

export default function RideDetailLoading() {
    return (
        <div className="space-y-4 -mx-4">
            {/* Header Skeleton */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-5">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl bg-white/20" />
                    <div>
                        <Skeleton className="h-5 w-24 bg-white/20" />
                        <Skeleton className="h-3 w-16 mt-1 bg-white/20" />
                    </div>
                </div>
                <div className="bg-white/20 rounded-2xl p-4">
                    <div className="flex gap-3">
                        <Skeleton className="w-3 h-24 rounded-full bg-white/30" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 bg-white/30" />
                            <Skeleton className="h-3 w-16 bg-white/30" />
                            <Skeleton className="h-4 w-28 bg-white/30" />
                        </div>
                        <div>
                            <Skeleton className="h-8 w-16 bg-white/30" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Driver Skeleton */}
            <div className="px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <Skeleton className="h-5 w-16 mb-4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Skeleton */}
            <div className="px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <Skeleton className="h-5 w-20 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="px-4 pb-4 flex gap-3">
                <Skeleton className="flex-1 h-14 rounded-2xl" />
                <Skeleton className="flex-1 h-14 rounded-2xl" />
            </div>
        </div>
    );
}
