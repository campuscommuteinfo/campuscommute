import { Skeleton } from "@/components/ui/skeleton";

export default function SafetyLoading() {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* SOS Button Skeleton */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32 bg-white/20" />
                        <Skeleton className="h-4 w-48 bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <Skeleton className="w-12 h-12 rounded-xl mb-3" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Emergency Contacts Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-24 rounded-xl" />
            </div>

            {/* Contact Cards */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="w-10 h-10 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
