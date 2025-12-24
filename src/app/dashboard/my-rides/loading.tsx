import { Skeleton } from "@/components/ui/skeleton";

export default function MyRidesLoading() {
    return (
        <div className="space-y-4 -mx-4 animate-fade-in">
            {/* Header */}
            <div className="px-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-14 h-14 rounded-2xl bg-white/20" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32 bg-white/20" />
                            <Skeleton className="h-4 w-20 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Voucher Cards */}
            <div className="px-4 space-y-4">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32 bg-white/20" />
                                    <Skeleton className="h-3 w-24 bg-white/20" />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                ))}

                {/* Get More Section */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="w-5 h-5 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
