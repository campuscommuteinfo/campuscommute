'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Users,
    Phone,
    MessageSquare,
    Star,
    IndianRupee,
    Car,
    Calendar,
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
                <Car className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Ride not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
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
            <div className="-mx-4">
                <RideChat
                    rideId={rideId}
                    rideName={`${ride.from} → ${ride.to}`}
                    onBack={() => setShowChat(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4 -mx-4">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-5">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:bg-white/30"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Ride Details</h1>
                        <p className="text-white/80 text-xs">{format(rideDate, 'PPP')}</p>
                    </div>
                </div>

                {/* Route Card */}
                <div className="bg-white/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                            <div className="w-0.5 h-8 bg-white/50" />
                            <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium">{ride.from}</p>
                            <p className="text-white/60 text-xs my-1">
                                {format(rideDate, 'h:mm a')}
                            </p>
                            <p className="text-white font-medium">{ride.to}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">₹{ride.price}</p>
                            <p className="text-white/80 text-xs">per seat</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Driver Info */}
            <div className="px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Driver</h2>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-indigo-100">
                            <AvatarImage src={ride.driverPhotoUrl} alt={ride.driverName} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                                {ride.driverName?.charAt(0) || 'D'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-white">
                                {ride.driverName}
                                {isOwnRide && (
                                    <Badge className="ml-2 bg-indigo-100 text-indigo-600 text-xs">
                                        You
                                    </Badge>
                                )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm text-gray-500">4.8 rating</span>
                            </div>
                        </div>
                        {!isOwnRide && (
                            <a
                                href={`tel:+91`}
                                className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                                aria-label="Call driver"
                            >
                                <Phone className="w-5 h-5 text-green-600" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Ride Details */}
            <div className="px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Ride Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {format(rideDate, 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {format(rideDate, 'h:mm a')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Seats</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {ride.seats} available
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    ₹{ride.price}/person
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    {ride.genderPreference === 'female' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Badge className="bg-pink-100 text-pink-600 dark:bg-pink-900/30">
                                Female Only Ride
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 flex gap-3">
                <Button
                    onClick={() => setShowChat(true)}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl"
                >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat
                </Button>

                {!isOwnRide && (
                    <Button
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                        Request to Join
                    </Button>
                )}

                {isOwnRide && (
                    <Button
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                    >
                        Manage Ride
                    </Button>
                )}
            </div>
        </div>
    );
}
