"use client";

import * as React from "react";
import { Wallet, Loader2, IndianRupee, User, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { rechargeWallet } from "@/app/actions/walletActions";
import { auth } from "@/lib/firebase";

interface ManualRechargeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        id: string;
        name?: string;
        email?: string;
    } | null;
}

export default function ManualRechargeModal({ open, onOpenChange, user }: ManualRechargeModalProps) {
    const { toast } = useToast();
    const [amount, setAmount] = React.useState<string>("100");
    const [isLoading, setIsLoading] = React.useState(false);

    if (!user) return null;

    const handleRecharge = async () => {
        const rechargeAmt = parseInt(amount);
        if (isNaN(rechargeAmt) || rechargeAmt <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid positive number.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Not authenticated");
            const token = await currentUser.getIdToken();

            // Re-using the rechargeWallet action
            // Note: In a real production app, we would have a separate 'adminRecharge' 
            // action with higher privileges and different logging.
            const result = await rechargeWallet(token, user.id, rechargeAmt);

            if (result.success) {
                toast({
                    title: "Admin Recharge Successful",
                    description: `Added ₹${rechargeAmt} to ${user.name || user.email}'s wallet.`,
                });
                onOpenChange(false);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-slate-950 border-white/10 text-white rounded-3xl backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight">Add <span className="text-indigo-400">Money</span></DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium tracking-tight">
                        Add money to a user's wallet.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">User</p>
                                <p className="text-sm font-bold text-white tracking-tight">{user.name || "Anonymous"}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount to Add (₹)</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-indigo-500 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleRecharge}
                        disabled={isLoading}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Add Money"
                        )}
                    </Button>
                </div>

                <div className="flex justify-center pt-2">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        Admin Only
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
