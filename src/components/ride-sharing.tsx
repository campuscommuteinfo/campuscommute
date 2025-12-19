"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  IndianRupee,
  MapPin,
  PlusCircle,
  Search,
  Users,
  User,
  Filter,
  X,
  Car,
  ArrowRight
} from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { collection, onSnapshot, query, addDoc, serverTimestamp } from "firebase/firestore";
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
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.99] transition-transform">
    {/* Route Header */}
    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{ride.from}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{ride.to}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600">₹{ride.price}</p>
          <p className="text-xs text-gray-500">per person</p>
        </div>
      </div>
    </div>

    {/* Driver Info */}
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10 border-2 border-indigo-100">
          <AvatarImage src={ride.driverPhotoUrl} alt={ride.driverName} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
            {ride.driverName?.substring(0, 2) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800 dark:text-white">{ride.driverName}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Verified</span>
            {ride.genderPreference === 'female' && (
              <Badge className="bg-pink-100 text-pink-600 text-[10px] px-1.5 py-0">
                Female Only
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{format(new Date(ride.rideDate), "MMM d, h:mm a")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-xs">{ride.seats} seats</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        className={cn(
          "w-full h-12 rounded-xl font-medium",
          isOwnRide
            ? "bg-gray-100 text-gray-500 dark:bg-gray-700"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        )}
        disabled={isOwnRide}
        onClick={onJoin}
      >
        {isOwnRide ? "Your Ride" : `Request to Join • ₹${ride.price}`}
      </Button>
    </div>
  </div>
);

export default function RideSharing() {
  const { toast } = useToast();
  const [allRides, setAllRides] = React.useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = React.useState<Ride[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [isPostRideDialogOpen, setIsPostRideDialogOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  const [isJoining, setIsJoining] = React.useState<string | null>(null);

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
        // Filter out past rides
        const rideDate = new Date(data.rideDate);
        if (rideDate >= now || isNaN(rideDate.getTime())) {
          ridesData.push({ id: docSnap.id, ...data } as Ride);
        }
      });

      // Sort by date (nearest first)
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
    if (isJoining) return; // Prevent double submission

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
      setIsJoining(null);
    }
  };

  React.useEffect(() => {
    const subscription = formMethods.watch(() => handleSearch());
    return () => subscription.unsubscribe();
  }, [formMethods, handleSearch]);

  return (
    <div className="space-y-4 -mx-4">
      {/* Search Header */}
      <div className="px-4 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-3">
        <FormProvider {...formMethods}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Search Inputs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <Input
                  placeholder="From where?"
                  className="h-10 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm"
                  {...formMethods.register("from")}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <Input
                  placeholder="To where?"
                  className="h-10 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm"
                  {...formMethods.register("to")}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  showFilters
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50"
                    : "bg-white dark:bg-gray-800 text-gray-600"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {showFilters && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl">
                  <User className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Female Only</span>
                  <Switch
                    checked={formMethods.watch('femaleOnly')}
                    onCheckedChange={(checked) => formMethods.setValue('femaleOnly', checked)}
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
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
      >
        <PlusCircle className="w-6 h-6" />
      </Button>

      {/* Results */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No rides found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsPostRideDialogOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Post a Ride
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                {filteredRides.length} rides found
              </h3>
              <button
                onClick={() => formMethods.reset()}
                className="text-xs text-indigo-600 font-medium"
              >
                Clear filters
              </button>
            </div>
            <div className="space-y-3">
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
