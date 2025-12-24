'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
    requestNotificationPermission,
    checkNotificationSupport,
    onForegroundMessage,
    showLocalNotification,
    canEnablePushNotifications
} from '@/lib/push-notifications';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type NotificationStatus = 'idle' | 'loading' | 'enabled' | 'denied' | 'unsupported' | 'not_configured';

export default function NotificationSettings() {
    const [status, setStatus] = React.useState<NotificationStatus>('idle');
    const [userId, setUserId] = React.useState<string | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        // Check if push notifications can be enabled
        const { canEnable, reason } = canEnablePushNotifications();

        if (!canEnable) {
            if (reason?.includes('VAPID')) {
                setStatus('not_configured');
            } else {
                setStatus('unsupported');
            }
            return;
        }

        // Check initial notification status
        const { supported, permission } = checkNotificationSupport();

        if (!supported) {
            setStatus('unsupported');
            return;
        }

        if (permission === 'granted') {
            setStatus('enabled');
        } else if (permission === 'denied') {
            setStatus('denied');
        }

        // Get current user
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid || null);
        });

        return () => unsubscribe();
    }, []);

    // Listen for foreground messages
    React.useEffect(() => {
        if (status !== 'enabled') return;

        const unsubscribe = onForegroundMessage((payload) => {
            // Show toast for foreground messages
            toast({
                title: payload.notification?.title || 'New Notification',
                description: payload.notification?.body,
            });

            // Also show a local notification if app is visible but not focused
            if (document.visibilityState === 'visible') {
                showLocalNotification(
                    payload.notification?.title || 'Commute Companion',
                    { body: payload.notification?.body }
                );
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [status, toast]);

    const handleEnableNotifications = async () => {
        if (!userId) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'Please log in to enable notifications',
            });
            return;
        }

        setStatus('loading');

        try {
            const token = await requestNotificationPermission(userId);

            if (token) {
                setStatus('enabled');
                toast({
                    title: '🔔 Notifications Enabled!',
                    description: "You'll receive updates about your rides",
                });
            } else {
                setStatus('denied');
                toast({
                    variant: 'destructive',
                    title: 'Permission Denied',
                    description: 'Please enable notifications in your browser settings',
                });
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            setStatus('idle');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not enable notifications',
            });
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="w-5 h-5 animate-spin" />;
            case 'enabled':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'denied':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'unsupported':
                return <BellOff className="w-5 h-5 text-gray-400" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'loading':
                return 'Enabling...';
            case 'enabled':
                return 'Notifications On';
            case 'denied':
                return 'Blocked';
            case 'unsupported':
                return 'Not Supported';
            default:
                return 'Enable Notifications';
        }
    };

    if (status === 'unsupported') {
        return (
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <BellOff className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                    <p className="font-medium text-sm text-gray-600 dark:text-gray-400">
                        Notifications not supported
                    </p>
                    <p className="text-xs text-gray-500">
                        Your browser doesn't support push notifications
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'not_configured') {
        return (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800 dark:text-white">
                        Push Notifications
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Coming soon
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                status === 'enabled'
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-gray-100 dark:bg-gray-700"
            )}>
                {getStatusIcon()}
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm text-gray-800 dark:text-white">
                    Push Notifications
                </p>
                <p className="text-xs text-gray-500">
                    {status === 'enabled'
                        ? 'Get updates about your rides'
                        : status === 'denied'
                            ? 'Blocked in browser settings'
                            : 'Stay updated on ride requests'}
                </p>
            </div>
            {status !== 'enabled' && status !== 'denied' && (
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleEnableNotifications}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Enable'
                    )}
                </Button>
            )}
            {status === 'enabled' && (
                <span className="text-xs text-green-600 font-medium">Active</span>
            )}
        </div>
    );
}
