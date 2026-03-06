'use client';

import { Inter } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Power } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center text-white">
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full" />
                        <div className="relative bg-slate-900 w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/5 animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Critical Failure</h1>
                    <p className="text-slate-400 font-medium max-w-md mb-10 leading-relaxed">
                        A system-level error has occurred. The grid has been temporarily destabilized.
                    </p>

                    <Button
                        onClick={() => reset()}
                        className="h-14 px-8 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        <Power className="w-4 h-4 mr-2" />
                        System Reset
                    </Button>

                    {error.digest && (
                        <div className="mt-12 font-mono text-[10px] text-slate-600 uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-lg">
                            Hash: {error.digest}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
