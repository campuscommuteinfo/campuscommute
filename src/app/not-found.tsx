"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-white/5 rotate-3 hover:rotate-6 transition-transform duration-500">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
            </div>

            <h1 className="text-8xl font-black text-slate-200 dark:text-slate-800 tracking-tighter mb-2">404</h1>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Signal Lost</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                The node you are looking for has either been moved or does not exist on this grid.
            </p>

            <Button asChild className="rounded-xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform font-bold">
                <Link href="/">
                    <MoveLeft className="w-4 h-4 mr-2" />
                    Return to Grid
                </Link>
            </Button>
        </div>
    );
}
