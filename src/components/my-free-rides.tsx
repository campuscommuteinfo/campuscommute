"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Ticket, Bus, Gift, QrCode, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";

interface RedeemedRide {
    id: string;
    title: string;
    points: number;
    redeemedAt: { toDate?: () => Date } | null;
}

// Voucher Card Component
const VoucherCard = ({ ride }: { ride: RedeemedRide }) => {
    const [showQR, setShowQR] = React.useState(false);
    const date = ride.redeemedAt?.toDate?.() || new Date();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-white/5 transition-all duration-500 hover:shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                        <Bus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-white text-lg tracking-tight">{ride.title}</h3>
                        <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold">Valid on all active routes</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide mb-6">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Unlocked: {date.toLocaleDateString()}</span>
                </div>

                {showQR ? (
                    <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 text-center border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 p-3 shadow-lg">
                            <QRCodeSVG
                                value={`commute-companion:voucher:${ride.id}:${ride.title}`}
                                size={144}
                                level="H"
                                includeMargin={false}
                                bgColor="#ffffff"
                                fgColor="#0f172a"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-widest">ID: {ride.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Present to Conductor</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQR(false)}
                            className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 font-bold text-xs"
                        >
                            Hide Access Code
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-widest text-xs"
                        onClick={() => setShowQR(true)}
                    >
                        <QrCode className="w-4 h-4 mr-2" />
                        Reveal Access Code
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
        let unsubscribeSnapshot: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = undefined;
            }

            if (currentUser) {
                const q = query(collection(db, "redeemed_vouchers"), where("userId", "==", currentUser.uid));
                unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const rides: RedeemedRide[] = [];
                    querySnapshot.forEach((doc) => {
                        rides.push({ id: doc.id, ...doc.data() } as RedeemedRide);
                    });
                    setRedeemedRides(rides);
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px] -mr-12 -mt-12 animate-pulse" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center shadow-xl border border-white/20 rotate-3">
                            <Ticket className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">Access Log</h1>
                            <p className="text-white/90 text-sm font-medium mt-1">{redeemedRides.length} Active Vouchers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="pb-4 min-h-[300px]">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-white/5 rounded-[2rem] h-48 animate-pulse shadow-lg" />
                        ))}
                    </div>
                ) : redeemedRides.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-200 dark:border-white/10 mt-8">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-2">Vault Empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium max-w-[200px] mx-auto">Accumulate points to unlock premium ride vouchers.</p>
                        <Link href="/dashboard/rewards">
                            <Button className="rounded-2xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-lg shadow-indigo-500/25">
                                <Gift className="w-3.5 h-3.5 mr-2" />
                                Visit Rewards Catalog
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {redeemedRides.map((ride) => (
                            <VoucherCard key={ride.id} ride={ride} />
                        ))}

                        {/* Get More Section */}
                        <Link href="/dashboard/rewards">
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] p-5 flex items-center justify-between active:scale-[0.98] transition-transform border border-indigo-100 dark:border-indigo-500/10 group hover:bg-indigo-100 dark:hover:bg-indigo-900/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Gift className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-indigo-900 dark:text-white uppercase tracking-tight">Unlock More</p>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Use your Points</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-indigo-500/20 flex items-center justify-center shadow-sm">
                                    <ChevronRight className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
