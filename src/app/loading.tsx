"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5">
                    <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
            </div>
            <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing System...</p>
        </div>
    );
}
