"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertOctagon } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <div className="relative bg-white dark:bg-slate-900 w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-white/5 -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <AlertOctagon className="w-10 h-10 text-red-500" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">System Malfunction</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                We encountered an unexpected error while processing your request. Our engineers have been notified.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={reset}
                    className="rounded-xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform font-bold"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reboot System
                </Button>
            </div>

            {error.digest && (
                <p className="mt-8 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                    Error Code: {error.digest}
                </p>
            )}
        </div>
    );
}
