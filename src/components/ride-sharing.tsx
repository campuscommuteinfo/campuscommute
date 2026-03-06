"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  PlusCircle,
  Users,
  Filter,
  Car,
  ShieldCheck,
  Search,
  MapPin
} from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { collection, onSnapshot, query, addDoc, serverTimestamp, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import PostRideDialog from "./post-ride-dialog";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Ride } from "@/lib/types";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

// Ride Card Component for Mobile
const RideCard = ({
  ride,
  onJoin,
  isOwnRide
}: {
  ride: Ride;
  onJoin: () => void;
  isOwnRide: boolean;
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 transition-all hover:border-indigo-500/30 group">
    {/* Driver Header */}
    <div className="p-5 pb-2">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-slate-100 dark:border-white/10">
          <AvatarImage src={ride.driverPhotoUrl} alt={ride.driverName} />
          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
            {ride.driverName?.substring(0, 2) || 'ST'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{ride.driverName}</p>
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Verified Student</span>
            {ride.genderPreference === 'female' && (
              <Badge className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0 border border-rose-100 dark:border-rose-500/20">
                Women Only
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-indigo-600 tracking-tight">₹{ride.price}</p>
          <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Seat</p>
        </div>
      </div>
    </div>

    {/* Route Details */}
    <div className="px-5 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
      <div className="flex gap-3 items-center">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <div className="w-px h-5 bg-indigo-200 dark:bg-indigo-500/20" />
          <MapPin className="w-2.5 h-2.5 text-rose-500" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Origin</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate">{ride.from}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Destination</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate">{ride.to}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="p-5 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{format(new Date(ride.rideDate), "h:mm a")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-3 h-3 text-indigo-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{ride.seats} Seats</span>
        </div>
      </div>

      <Button
        className={cn(
          "px-5 h-10 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all",
          isOwnRide
            ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 border-0"
            : "bg-indigo-600 hover:bg-indigo-700 text-white border-0"
        )}
        disabled={isOwnRide}
        onClick={onJoin}
      >
        {isOwnRide ? "Owner" : "Join Ride"}
      </Button>
    </div>
  </div>
);

export default function RideSharing() {
  const { toast } = useToast();
  const [allRides, setAllRides] = React.useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = React.useState<Ride[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<import("firebase/auth").User | null>(null);
  const [isPostRideDialogOpen, setIsPostRideDialogOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  const [isJoining, setIsJoining] = React.useState<string | null>(null);
  const isJoiningRef = React.useRef(false);

  const formMethods = useForm({
    defaultValues: {
      from: "",
      to: "",
      femaleOnly: false,
    }
  });

  React.useEffect(() => {
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) setUser(currentUser);
    });

    const q = query(collection(db, "rides"));
    const unsubscribeRides = onSnapshot(q, (querySnapshot) => {
      if (!isMounted) return;

      const now = new Date();
      const ridesData: Ride[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const rideDate = new Date(data.rideDate);
        if (rideDate >= now || isNaN(rideDate.getTime())) {
          ridesData.push({ id: docSnap.id, ...data } as Ride);
        }
      });

      ridesData.sort((a, b) => new Date(a.rideDate).getTime() - new Date(b.rideDate).getTime());

      setAllRides(ridesData);
      setFilteredRides(ridesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching rides:", error);
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      unsubscribeRides();
    };
  }, []);

  const handleSearch = formMethods.handleSubmit(() => {
    const { from, to, femaleOnly } = formMethods.getValues();
    let rides = allRides;
    if (from) {
      rides = rides.filter(ride => ride.from.toLowerCase().includes(from.toLowerCase()));
    }
    if (to) {
      rides = rides.filter(ride => ride.to.toLowerCase().includes(to.toLowerCase()));
    }
    if (femaleOnly) {
      rides = rides.filter(ride => ride.genderPreference === 'female');
    }
    setFilteredRides(rides);
  });

  const handleRequestJoin = async (ride: Ride) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In" });
      return;
    }
    if (ride.driverId === user.uid) {
      toast({ variant: "destructive", title: "This is your ride" });
      return;
    }
    if (isJoiningRef.current) return;

    // Check for existing request (Deduplication)
    try {
      const q = query(
        collection(db, "ride_requests"),
        where("rideId", "==", ride.id),
        where("requesterId", "==", user.uid)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        toast({ title: "Already Requested", description: "You have a pending request for this ride" });
        return;
      }
    } catch (e) {
      console.error("Deduplication check failed", e);
    }

    isJoiningRef.current = true;
    setIsJoining(ride.id);

    try {
      await addDoc(collection(db, "ride_requests"), {
        rideId: ride.id,
        driverId: ride.driverId,
        requesterId: user.uid,
        requesterName: user.displayName || "A Student",
        requesterPhotoUrl: user.photoURL || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Request Sent! ✓",
        description: `Waiting for ${ride.driverName} to accept`,
      });
    } catch (error) {
      console.error("Error sending request:", error);
      toast({ variant: "destructive", title: "Request Failed", description: "Please try again" });
    } finally {
      isJoiningRef.current = false;
      setIsJoining(null);
    }
  };

  React.useEffect(() => {
    const subscription = formMethods.watch(() => handleSearch());
    return () => subscription.unsubscribe();
  }, [formMethods, handleSearch]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl -mx-6 px-6 pb-6 pt-2 border-b border-slate-100 dark:border-white/5">
        <FormProvider {...formMethods}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Search Core */}
            <div className="relative">
              <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-200 dark:border-white/5 pb-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="From..."
                    className="h-8 border-0 bg-transparent text-xs font-bold uppercase tracking-wider placeholder:text-slate-400 focus-visible:ring-0 p-0"
                    {...formMethods.register("from")}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="To..."
                    className="h-8 border-0 bg-transparent text-xs font-bold uppercase tracking-wider placeholder:text-slate-400 focus-visible:ring-0 p-0"
                    {...formMethods.register("to")}
                  />
                </div>
              </div>
            </div>

            {/* Sub Filters */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all",
                  showFilters
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500"
                )}
              >
                <Filter className="w-3 h-3" />
                Options
              </button>

              {showFilters && (
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl animate-in fade-in slide-in-from-right-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Women Only</span>
                  <Switch
                    checked={formMethods.watch('femaleOnly')}
                    onCheckedChange={(checked) => formMethods.setValue('femaleOnly', checked)}
                    className="scale-75 data-[state=checked]:bg-rose-500"
                  />
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Post Ride FAB */}
      <Button
        onClick={() => setIsPostRideDialogOpen(true)}
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-105 active:scale-95 transition-all border-0"
      >
        <PlusCircle className="w-7 h-7" />
      </Button>

      {/* Results Node */}
      <div className="pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-2xl h-48 animate-pulse border border-slate-100 dark:border-white/5" />
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-10 text-center border border-slate-200 dark:border-white/5">
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">No Rides Found</p>
            <p className="text-[10px] text-slate-500 font-medium mb-6">Share a ride with others or post your own trip.</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl font-bold uppercase tracking-wider text-[9px] px-5 h-9 border-slate-200 dark:border-white/10"
              onClick={() => setIsPostRideDialogOpen(true)}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-2" />
              Post a Ride
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {filteredRides.length} Rides Found
              </h3>
              <button
                onClick={() => formMethods.reset()}
                className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-6">
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onJoin={() => handleRequestJoin(ride)}
                  isOwnRide={ride.driverId === user?.uid}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <PostRideDialog open={isPostRideDialogOpen} onOpenChange={setIsPostRideDialogOpen} />
    </div>
  );
}
