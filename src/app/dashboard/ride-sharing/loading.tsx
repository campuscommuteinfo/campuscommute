import { Skeleton } from "@/components/ui/skeleton";

export default function RideSharingLoading() {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-12 rounded-full ml-auto" />
            </div>

            {/* Ride Cards */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* Driver Info */}
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>

                        {/* Route */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 mb-4">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>

                        {/* Action Button */}
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
