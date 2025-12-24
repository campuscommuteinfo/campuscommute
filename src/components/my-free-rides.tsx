"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Ticket, Bus, Gift, QrCode, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface RedeemedRide {
    id: string;
    title: string;
    points: number;
    redeemedAt: any;
}

// Voucher Card Component
const VoucherCard = ({ ride }: { ride: RedeemedRide }) => {
    const [showQR, setShowQR] = React.useState(false);
    const date = ride.redeemedAt?.toDate?.() || new Date();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">{ride.title}</h3>
                        <p className="text-white/80 text-xs">Valid on all routes</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Redeemed: {date.toLocaleDateString()}</span>
                </div>

                {showQR ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                        <div className="w-36 h-36 mx-auto bg-white rounded-lg flex items-center justify-center mb-3 p-2">
                            <QRCodeSVG
                                value={`commute-companion:voucher:${ride.id}:${ride.title}`}
                                size={128}
                                level="H"
                                includeMargin={false}
                                bgColor="#ffffff"
                                fgColor="#1f2937"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mb-1 font-mono">ID: {ride.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 mb-3">Show this to the conductor</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQR(false)}
                            className="rounded-xl"
                        >
                            Hide QR Code
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        onClick={() => setShowQR(true)}
                    >
                        <QrCode className="w-4 h-4 mr-2" />
                        Show QR Code
                    </Button>
                )}
            </div>
        </div>
    );
};

export default function MyFreeRides() {
    const [redeemedRides, setRedeemedRides] = React.useState<RedeemedRide[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const q = query(collection(db, "redeemed_vouchers"), where("userId", "==", currentUser.uid));
                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const rides: RedeemedRide[] = [];
                    querySnapshot.forEach((doc) => {
                        rides.push({ id: doc.id, ...doc.data() } as RedeemedRide);
                    });
                    setRedeemedRides(rides);
                    setIsLoading(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <div className="space-y-4 -mx-4">
            {/* Header */}
            <div className="px-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">My Vouchers</h1>
                            <p className="text-white/80 text-sm">{redeemedRides.length} available</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-40 animate-pulse" />
                        ))}
                    </div>
                ) : redeemedRides.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">No Vouchers Yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Redeem your points to get free ride vouchers</p>
                        <Link href="/dashboard/rewards">
                            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <Gift className="w-4 h-4 mr-2" />
                                Go to Rewards
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {redeemedRides.map((ride) => (
                            <VoucherCard key={ride.id} ride={ride} />
                        ))}

                        {/* Get More Section */}
                        <Link href="/dashboard/rewards">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Gift className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-800 dark:text-white">Get More Vouchers</p>
                                        <p className="text-xs text-gray-500">Redeem your points</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
