"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Ticket, ShoppingCart, Star, Utensils } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform">
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <Image
          src={reward.image}
          alt={reward.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className={cn(
          "absolute bottom-2 left-2 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
          reward.color
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs">
          {reward.brand}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-white mb-2">{reward.title}</h3>
        <Button
          className={cn(
            "w-full h-10 rounded-xl text-sm font-medium",
            canRedeem
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              : "bg-gray-100 text-gray-400 dark:bg-gray-700"
          )}
          disabled={!canRedeem || isRedeeming}
          onClick={onRedeem}
        >
          {isRedeeming ? "Redeeming..." : `${reward.points} pts`}
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
  const { toast } = useToast();

  React.useEffect(() => {
    let isMounted = true;
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);

        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            setUserPoints(docSnap.data().points || 0);
          }
        }, (error) => {
          console.error("Error fetching user points:", error);
        });
      } else {
        setUser(null);
        setUserPoints(0);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In" });
      return;
    }
    if (userPoints < reward.points) {
      toast({ variant: "destructive", title: "Not Enough Points", description: `Need ${reward.points - userPoints} more points` });
      return;
    }

    setIsRedeeming(reward.title);

    try {
      // Use secure server action instead of client-side transaction
      const result = await redeemReward(user.uid, reward.title, reward.points);

      if (result.success) {
        toast({
          title: "🎉 Redeemed!",
          description: `You got ${reward.title}. New balance: ${result.newPoints} pts`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed",
          description: result.error || "Please try again"
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed", description: "Please try again" });
    } finally {
      setIsRedeeming(null);
    }
  };

  return (
    <div className="space-y-4 -mx-4">
      {/* Points Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 mx-4 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Your Points Balance</p>
            <p className="text-4xl font-bold">{userPoints.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Star className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-white/80">Rides Taken</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-white/80">Redeemed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4">
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
            activeTab === "rewards"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          )}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Rewards
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium text-sm transition-all",
            activeTab === "history"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          )}
        >
          <Star className="w-4 h-4 inline mr-2" />
          History
        </button>
      </div>

      {/* Content */}
      {activeTab === "rewards" ? (
        <div className="grid grid-cols-2 gap-3 px-4">
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
        <div className="px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No redemption history yet</p>
            <p className="text-xs text-gray-400 mt-1">Start redeeming rewards!</p>
          </div>
        </div>
      )}

      {/* How to Earn Section */}
      <div className="px-4 pb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">How to Earn Points</h3>
        <div className="space-y-2">
          {[
            { action: "Track a ride", points: "+10 pts" },
            { action: "Report crowd level", points: "+5 pts" },
            { action: "Share a ride", points: "+20 pts" },
            { action: "Complete your profile", points: "+50 pts" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.action}</span>
              <span className="text-sm font-semibold text-green-600">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
