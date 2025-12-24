import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-36 bg-white/20" />
                        <Skeleton className="h-4 w-48 bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <Skeleton className="h-6 w-12 mx-auto mb-2" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-5 w-32" />
                </div>

                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="w-5 h-5 rounded" />
                    </div>
                ))}
            </div>

            {/* Preferences Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-5 w-28" />
                </div>

                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                        <Skeleton className="w-12 h-6 rounded-full" />
                    </div>
                ))}
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="w-5 h-5 rounded" />
                </div>
            </div>
        </div>
    );
}
