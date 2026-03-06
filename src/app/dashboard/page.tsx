"use client";

import * as React from "react";
import {
  MapPin,
  Bus,
  Users,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Activity,
  Clock,
  Navigation2
} from "lucide-react";
import LiveTracking from "@/components/live-tracking";
import { type Vehicle } from "@/lib/types";
import VehicleCard from "@/components/vehicle-card";
import XAIDashboard from "@/components/xai-dashboard";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import WalletModal from "@/components/wallet-modal";
import { doc } from "firebase/firestore";

// Stat card component
const StatCard = ({ icon: Icon, label, value, trend, color, delay }: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  color: string;
  delay: string;
}) => (
  <div className={cn(
    "bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
    delay
  )}>
    <div className="flex items-center gap-4 mb-3">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
        <TrendingUp className="w-3 h-3" />
        <span>{trend}</span>
      </div>
    )}
  </div>
);

// Recent activity card
const ActivityCard = ({ route, time, status }: { route: string; time: string; status: "completed" | "active" }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all group">
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
      status === "active" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
    )}>
      <Navigation2 className={cn("w-6 h-6 fill-current", status === "active" ? "animate-pulse" : "opacity-50")} />
    </div>
    <div className="flex-1">
      <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{route}</p>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
        <Clock className="w-3 h-3" />
        {time}
      </p>
    </div>
    {status === "active" && (
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
      </span>
    )}
  </div>
);

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [showXAI, setShowXAI] = React.useState(false);
  const [stats, setStats] = React.useState({ busesNearby: 0, activeRides: 0 });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [nearbyStops, setNearbyStops] = React.useState<any[]>([]);
  const [userData, setUserData] = React.useState({ points: 0, walletBalance: 0 });

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const ridesQuery = query(
          collection(db, "rides"),
          where("driverId", "==", currentUser.uid)
        );

        onSnapshot(ridesQuery, (snapshot) => {
          const activities = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              status: "active" as const
            }))
            .sort((a: any, b: any) => {
              const dateA = a.createdAt?.toDate?.() || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);
          setRecentActivity(activities);
        });

        // Listen for user data (points, wallet)
        const userRef = doc(db, "users", currentUser.uid);
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserData({
              points: data.points || 0,
              walletBalance: data.walletBalance || 0
            });
          }
        });
      }
    });

    const unsubscribeVehicles = onSnapshot(query(collection(db, "vehicles")), (snapshot) => {
      setStats(prev => ({ ...prev, busesNearby: snapshot.size }));
    });

    const unsubscribeRides = onSnapshot(query(collection(db, "rides")), (snapshot) => {
      setStats(prev => ({ ...prev, activeRides: snapshot.size }));
    });

    const unsubscribeStops = onSnapshot(query(collection(db, "stops"), limit(3)), (snapshot) => {
      if (!snapshot.empty) {
        setNearbyStops(snapshot.docs.map(doc => doc.data()));
      } else {
        setNearbyStops([
          { name: "Knowledge Park 3", distance: "200m", buses: "73A, 100B" },
          { name: "Sharda University Gate", distance: "450m", buses: "73A, 52" },
          { name: "Alpha 1 Metro", distance: "1.2km", buses: "Metro" },
        ]);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeVehicles();
      unsubscribeRides();
      unsubscribeStops();
    };
  }, []);

  const handleAddPoints = (amount: number, title: string, description: string) => {
    // Explicitly use amount to silence unused parameter warning
    void amount;
    toast({
      title: title,
      description: description,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Platform Status */}
      <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-500" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Is it working?</p>
            <p className="text-xs font-bold text-slate-900 dark:text-emerald-400">Everything is running perfectly</p>
          </div>
        </div>
        <Link href="/dashboard/safety" className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors">
          <ChevronRight className="w-4 h-4 text-emerald-500" />
        </Link>
      </div>

      {/* Hero Section - Live Tracking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">See <span className="text-indigo-600">Buses</span></h2>
          <div className="flex items-center gap-3">
            <WalletModal
              balance={userData.walletBalance}
              points={userData.points}
              onUpdate={(bal, pts) => setUserData(prev => ({
                walletBalance: bal,
                points: pts !== undefined ? pts : prev.points
              }))}
            />
            <Link href="/dashboard/ride-sharing" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
              Find a Ride <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 aspect-[16/10] sm:aspect-auto">
          <LiveTracking onVehicleSelect={setSelectedVehicle} selectedVehicle={selectedVehicle} />
        </div>
      </div>

      {/* Selected Vehicle Card Overlay */}
      {selectedVehicle && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <VehicleCard
            key={selectedVehicle.id}
            vehicle={selectedVehicle}
            addPoints={handleAddPoints}
            onClose={() => setSelectedVehicle(null)}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Bus}
          label="Buses Near You"
          value={stats.busesNearby.toString()}
          color="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700"
          delay="duration-300"
        />
        <StatCard
          icon={Users}
          label="Active Rides"
          value={stats.activeRides.toString()}
          trend={`${stats.activeRides > 0 ? '+' : ''}${stats.activeRides} active`}
          color="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-indigo-600 dark:to-purple-600"
          delay="duration-500"
        />
      </div>

      {/* XAI Integration */}
      <div className="space-y-3">
        <button
          onClick={() => setShowXAI(!showXAI)}
          className="w-full flex items-center justify-between p-5 bg-slate-900 dark:bg-white/5 rounded-3xl text-white shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest mb-0.5">AI Helper</p>
              <p className="text-slate-400 text-[10px] font-medium tracking-tight">Simple help for your travel</p>
            </div>
          </div>
          <div className={cn("p-2 rounded-xl bg-white/5 transition-transform duration-300", showXAI ? "rotate-90" : "")}>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </button>

        {showXAI && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <XAIDashboard routeId="73A" />
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            History
          </h3>
          <Link href="/dashboard/my-rides" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">
            History
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, i) => (
              <ActivityCard
                key={i}
                route={`${activity.from} → ${activity.to}`}
                time={activity.createdAt?.toDate ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true }) : "Recent"}
                status={activity.status}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No activity nodes detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Network */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-white/5">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          Nearby Stops
        </h3>
        <div className="space-y-4">
          {nearbyStops.map((stop, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl group transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{stop.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{stop.buses}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-widest">{stop.distance}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">~{i + 1} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
