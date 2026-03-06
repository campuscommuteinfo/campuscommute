'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Clock,
    Users,
    Phone,
    MessageSquare,
    Car,
    Calendar,
    Navigation2,
    Shield
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format } from 'date-fns';
import RideChat from '@/components/ride-chat';
import { Ride } from '@/lib/types';

interface RideDetailClientProps {
    rideId: string;
}

export default function RideDetailClient({ rideId }: RideDetailClientProps) {
    const router = useRouter();
    const [ride, setRide] = React.useState<Ride | null>(null);
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showChat, setShowChat] = React.useState(false);

    // Auth listener
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Ride data listener
    React.useEffect(() => {
        if (!rideId) return;

        const rideRef = doc(db, 'rides', rideId);
        const unsubscribe = onSnapshot(rideRef, (docSnap) => {
            if (docSnap.exists()) {
                setRide({ id: docSnap.id, ...docSnap.data() } as Ride);
            }
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching ride:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [rideId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Car className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-900 dark:text-white font-bold uppercase tracking-tight text-lg">Signal Lost</p>
                <p className="text-slate-500 font-medium text-sm mt-1 mb-6">This ride is no longer active.</p>
                <Button
                    variant="outline"
                    className="rounded-xl px-6 font-bold uppercase tracking-wide border-slate-200 dark:border-white/10"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const rideDate = new Date(ride.rideDate);
    const isOwnRide = ride.driverId === user?.uid;

    // Show chat view
    if (showChat) {
        return (
            <div className="-mx-4 animate-in slide-in-from-right duration-300">
                <RideChat
                    rideId={rideId}
                    rideName={`${ride.from} → ${ride.to}`}
                    onBack={() => setShowChat(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 -mx-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-b-[2rem] p-6 pb-24 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -ml-16 -mb-16" />

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors backdrop-blur-md"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="text-right">
                        <h1 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Ride Details</h1>
                        <p className="text-white font-bold text-sm tracking-tight">{format(rideDate, 'PPP')}</p>
                    </div>
                </div>

                {/* Route Card Overlay */}
                <div className="absolute -bottom-16 left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center pt-1 self-stretch">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 my-1 min-h-[40px]" />
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Starting Point</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{ride.from}</p>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(rideDate, 'h:mm a')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{ride.to}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-xl inline-block shadow-sm">
                                <p className="text-xl font-bold">₹{ride.price}</p>
                                <p className="text-[9px] uppercase tracking-wider font-bold opacity-80 text-center">Seat</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer for overlay */}
            <div className="h-12" />

            {/* Driver Info */}
            <div className="px-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Driver Details</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-16 h-16 border border-slate-100 dark:border-white/10 shadow-sm rounded-2xl">
                                <AvatarImage src={ride.driverPhotoUrl} alt={ride.driverName} />
                                <AvatarFallback className="bg-slate-800 text-white font-bold text-xl rounded-2xl">
                                    {ride.driverName?.charAt(0) || 'D'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg border-2 border-slate-50 dark:border-slate-900 uppercase tracking-tight">
                                4.8★
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {ride.driverName}
                                {isOwnRide && (
                                    <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider border-0">
                                        You
                                    </Badge>
                                )}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">Verified Driver • 150+ Trips</p>
                        </div>
                        {!isOwnRide && (
                            <a
                                className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/10 active:scale-95 transition-transform"
                                aria-label="Call driver"
                            >
                                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Ride Details Grid */}
            <div className="px-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                            <Calendar className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{format(rideDate, 'MMM d')}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3">
                            <Clock className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{format(rideDate, 'h:mm a')}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                            <Users className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{ride.seats} Seats Left</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                            <Car className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Sedan</p>
                    </div>
                </div>

                {/* Preferences */}
                {ride.genderPreference === 'female' && (
                    <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-500/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide">Women Only</p>
                            <p className="text-[10px] text-pink-600/80 dark:text-pink-400">Strictly enforced for safety</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 flex gap-3">
                <Button
                    onClick={() => setShowChat(true)}
                    variant="outline"
                    className="flex-1 h-14 rounded-xl border-slate-200 dark:border-white/10 font-bold uppercase tracking-wide text-xs hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat
                </Button>

                {!isOwnRide ? (
                    <Button
                        className="flex-[2] h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-sm active:scale-95 transition-all"
                    >
                        <Navigation2 className="w-5 h-5 mr-2" />
                        Request Seat
                    </Button>
                ) : (
                    <Button
                        className="flex-[2] h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-wider text-xs shadow-sm active:scale-95 transition-all"
                    >
                        Edit Ride
                    </Button>
                )}
            </div>
        </div>
    );
}
