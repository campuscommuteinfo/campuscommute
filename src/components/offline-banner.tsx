'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOffline(false);
            setShowReconnected(true);

            // Hide reconnected message after 3 seconds
            setTimeout(() => setShowReconnected(false), 3000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline && !showReconnected) return null;

    return (
        <div
            className={cn(
                'fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300',
                'flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium',
                isOffline
                    ? 'bg-amber-500 text-white'
                    : 'bg-green-500 text-white'
            )}
            role="alert"
            aria-live="polite"
        >
            {isOffline ? (
                <>
                    <WifiOff className="w-4 h-4" aria-hidden="true" />
                    <span>You&apos;re offline. Some features may be limited.</span>
                </>
            ) : (
                <>
                    <Wifi className="w-4 h-4" aria-hidden="true" />
                    <span>Back online!</span>
                </>
            )}
        </div>
    );
}
