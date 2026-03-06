"use client";

import * as React from "react";
import {
    Wallet,
    Plus,
    Trophy,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Zap
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { rechargeWallet, convertPointsToWallet } from "@/app/actions/walletActions";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface WalletModalProps {
    balance: number;
    points: number;
    onUpdate?: (newBalance: number, newPoints?: number) => void;
    children?: React.ReactNode;
}

export default function WalletModal({ balance, points, onUpdate, children }: WalletModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const handleRecharge = async (amount: number) => {
        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");
            const token = await user.getIdToken();

            const result = await rechargeWallet(token, user.uid, amount);

            if (result.success) {
                toast({
                    title: "Recharge Successful",
                    description: `₹${amount} added to your campus wallet.`,
                });
                onUpdate?.(result.newBalance!);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Recharge Failed",
                description: error instanceof Error ? error.message : "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConvert = async () => {
        if (points < 100) {
            toast({
                variant: "destructive",
                title: "Insufficient Points",
                description: "Minimum 100 points required for conversion.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");
            const token = await user.getIdToken();

            const result = await convertPointsToWallet(token, user.uid, points);

            if (result.success) {
                toast({
                    title: "Conversion Successful",
                    description: `Transferred balance to your wallet.`,
                });
                onUpdate?.(result.newBalance!, result.newPoints!);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Conversion Failed",
                description: error instanceof Error ? error.message : "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10">
                        <Wallet className="w-5 h-5 mr-2" />
                        ₹{balance}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px] bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-3xl p-0 overflow-hidden font-sans">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Travel Wallet</DialogTitle>
                            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                Money for travel
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Balance Card */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">In your wallet</p>
                        <div className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 flex items-baseline gap-1">
                            ₹{balance}
                        </div>
                    </div>

                    {/* Quick Recharge */}
                    <div className="space-y-3">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 pl-1">Add Money</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {[100, 200, 500].map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    onClick={() => handleRecharge(amount)}
                                    disabled={isLoading}
                                    className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-indigo-500/30 text-slate-700 dark:text-slate-300 font-bold rounded-xl active:scale-95 transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `₹${amount}`}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Convert Points */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Travel Points</span>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-none font-bold text-[9px]">
                                {points} PTS
                            </Badge>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium">10 Points = ₹1. Need 100 points.</p>
                        <Button
                            onClick={handleConvert}
                            disabled={isLoading || points < 100}
                            variant="secondary"
                            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-none transition-all"
                        >
                            Move to Wallet
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Safe and Secure
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
