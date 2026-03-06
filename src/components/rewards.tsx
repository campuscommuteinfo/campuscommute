"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Ticket, ShoppingCart, Utensils, Zap, Trophy, History } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { redeemReward } from "@/app/actions/rewardsActions";

const rewards = [
  {
    title: "₹50 Ride Voucher",
    points: 200,
    brand: "Transport",
    icon: Ticket,
    color: "from-indigo-500 to-purple-600",
    image: "https://images.unsplash.com/photo-1587135325273-adef4e88bc25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    title: "₹100 Amazon Voucher",
    points: 500,
    brand: "Lifestyle",
    icon: ShoppingCart,
    color: "from-blue-500 to-cyan-600",
    image: "https://images.unsplash.com/photo-1601598505513-7489a6272d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    title: "₹100 Blinkit Voucher",
    points: 500,
    brand: "Lifestyle",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-600",
    image: "https://images.unsplash.com/photo-1537130508986-20f4fd870b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    title: "Canteen Coupon",
    points: 300,
    brand: "Campus",
    icon: Utensils,
    color: "from-orange-500 to-red-600",
    image: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
];

// Reward Card Component
const RewardCard = ({
  reward,
  userPoints,
  onRedeem,
  isRedeeming
}: {
  reward: typeof rewards[0];
  userPoints: number;
  onRedeem: () => void;
  isRedeeming: boolean;
}) => {
  const canRedeem = userPoints >= reward.points;
  const Icon = reward.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 dark:border-white/5 group relative active:scale-[0.98] transition-all">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={reward.image}
          alt={reward.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        <div className={cn(
          "absolute bottom-3 left-3 w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg backdrop-blur-md border border-white/10",
          reward.color
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <Badge className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white border-0 text-[10px] font-black uppercase tracking-widest pl-2 pr-3 py-1">
          {reward.brand}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight mb-4 leading-tight min-h-[2.5rem]">{reward.title}</h3>
        <Button
          className={cn(
            "w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
            canRedeem
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl dark:shadow-white/20 hover:scale-[1.02]"
              : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
          )}
          disabled={!canRedeem || isRedeeming}
          onClick={onRedeem}
        >
          {isRedeeming ? (
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
              Processing
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {canRedeem ? "Claim Reward" : "Locked"}
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{reward.points} Pts</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function Rewards() {
  const [userPoints, setUserPoints] = React.useState(0);
  const [user, setUser] = React.useState<User | null>(null);
  const [isRedeeming, setIsRedeeming] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"rewards" | "history">("rewards");
  const [stats, setStats] = React.useState({ ridesTaken: 0, redeemed: 0 });
  interface RedemptionHistory {
    id: string;
    title: string;
    points: number;
    redeemedAt: any;
    status: string;
  }

  const [history, setHistory] = React.useState<RedemptionHistory[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    let unsubscribeRides: (() => void) | undefined;
    let unsubscribeVouchers: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Clean up previous listeners
      if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = undefined; }
      if (unsubscribeRides) { unsubscribeRides(); unsubscribeRides = undefined; }
      if (unsubscribeVouchers) { unsubscribeVouchers(); unsubscribeVouchers = undefined; }

      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);

        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserPoints(docSnap.data().points || 0);
          }
        });

        // Fetch ride count
        const ridesQuery = query(collection(db, "rides"), where("driverId", "==", currentUser.uid));
        unsubscribeRides = onSnapshot(ridesQuery, (snap) => {
          setStats(prev => ({ ...prev, ridesTaken: snap.size }));
        });

        // Fetch redemption count and history
        const vouchersQuery = query(collection(db, "redeemed_vouchers"), where("userId", "==", currentUser.uid));
        unsubscribeVouchers = onSnapshot(vouchersQuery, (snap) => {
          setStats(prev => ({ ...prev, redeemed: snap.size }));
          setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedemptionHistory)));
        });

      } else {
        setUser(null);
        setUserPoints(0);
        setStats({ ridesTaken: 0, redeemed: 0 });
        setHistory([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeRides) unsubscribeRides();
      if (unsubscribeVouchers) unsubscribeVouchers();
    };
  }, []);

  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In" });
      return;
    }
    if (userPoints < reward.points) {
      toast({ variant: "destructive", title: "Locked", description: `You need ${reward.points - userPoints} more points to unlock this.` });
      return;
    }

    setIsRedeeming(reward.title);

    try {
      const token = await user.getIdToken();
      const result = await redeemReward(token, user.uid, reward.title, reward.points);

      if (result.success) {
        toast({
          title: "Reward Unlocked! 🎁",
          description: `${reward.title} has been added to your vault.`,
          className: "bg-slate-900 border-white/10 text-white"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: result.error || "Please try again later"
        });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network request failed" });
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Points Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-16 -mt-16 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -ml-16 -mb-16" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Vault Balance</p>
              <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
                {userPoints.toLocaleString()}
                <span className="text-lg text-slate-500 font-bold tracking-normal">PTS</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <p className="text-2xl font-black">{stats.ridesTaken}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Trips Completed</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <p className="text-2xl font-black">{stats.redeemed}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Rewards Claimed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-[1.25rem] flex gap-2 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "rewards"
              ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg"
              : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"
          )}
        >
          <Gift className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
          Catalog
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "history"
              ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg"
              : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"
          )}
        >
          <History className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
          Timeline
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {activeTab === "rewards" ? (
          <div className="grid grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <RewardCard
                key={index}
                reward={reward}
                userPoints={userPoints}
                onRedeem={() => handleRedeem(reward)}
                isRedeeming={isRedeeming === reward.title}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                    <Ticket className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">
                      {item.redeemedAt?.toDate ? item.redeemedAt.toDate().toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <Gift className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Vault Empty</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Earn More Footer */}
      <div className="rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 p-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Boost your balance
        </h3>
        <div className="space-y-3">
          {[
            { action: "Initialize a Journey", points: "+10" },
            { action: "Report Grid Status", points: "+5" },
            { action: "Share your Node", points: "+20" },
            { action: "Verify Profile", points: "+50" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/50 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{item.action}</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-black">
                {item.points} PTS
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
