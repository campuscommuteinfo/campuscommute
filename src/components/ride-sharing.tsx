
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, IndianRupee, MapPin, PlusCircle, Search, Users, Route, User } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";
import PostRideDialog from "./post-ride-dialog";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Ride } from "@/lib/types";
import Image from "next/image";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const getStaticMapUrl = (from: string, to: string) => {
    const params = new URLSearchParams({
        size: "400x250",
        path: `color:0xff9933ff|weight:5|${from}|${to}`,
        key: GOOGLE_MAPS_API_KEY || "",
    });
    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export default function RideSharing() {
  const { toast } = useToast();
  const [allRides, setAllRides] = React.useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = React.useState<Ride[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [isPostRideDialogOpen, setIsPostRideDialogOpen] = React.useState(false);


  const formMethods = useForm({
    defaultValues: {
      from: "",
      to: "",
      femaleOnly: false,
    }
  });

   React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
     const q = query(collection(db, "rides"));
     const unsubscribeRides = onSnapshot(q, (querySnapshot) => {
        const ridesData: Ride[] = [];
        querySnapshot.forEach((doc) => {
            ridesData.push({ id: doc.id, ...doc.data() } as Ride);
        });
        setAllRides(ridesData);
        setFilteredRides(ridesData);
        setIsLoading(false);
     });
    
     return () => {
         unsubscribeAuth();
         unsubscribeRides();
     }
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
        toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to request a ride." });
        return;
    }
    if (ride.driverId === user.uid) {
        toast({ variant: "destructive", title: "This is Your Ride", description: "You cannot request to join your own ride." });
        return;
    }
    
    try {
        await addDoc(collection(db, "ride_requests"), {
            rideId: ride.id,
            driverId: ride.driverId,
            requesterId: user.uid,
            requesterName: user.displayName || "A Student",
            status: "pending",
            createdAt: serverTimestamp(),
        });

        toast({
            title: "✅ Request Sent!",
            description: `Your request to join the ride to ${ride.to} has been sent to the driver.`,
        });
    } catch (error) {
        console.error("Error sending request:", error);
         toast({
            variant: "destructive",
            title: "Request Failed",
            description: "Could not send your join request. Please try again.",
        });
    }
  }
  
  // Watch for changes in the form to trigger search
  React.useEffect(() => {
      const subscription = formMethods.watch(() => handleSearch());
      return () => subscription.unsubscribe();
  }, [formMethods, handleSearch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find or Offer a Ride</CardTitle>
          <CardDescription>
            Share a ride with fellow students to save on your commute, or offer a ride to earn points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...formMethods}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="From" 
                    className="pl-10" 
                    {...formMethods.register("from")}
                  />
                </div>
                 <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="To" 
                    className="pl-10" 
                    {...formMethods.register("to")}
                  />
                </div>
              </div>
               <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <User className="text-pink-500" />
                        <Label htmlFor="female-only-switch">Female-only rides</Label>
                    </div>
                    <Switch
                        id="female-only-switch"
                        checked={formMethods.watch('femaleOnly')}
                        onCheckedChange={(checked) => formMethods.setValue('femaleOnly', checked)}
                    />
                </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Button type="submit" className="w-full md:flex-1" onClick={handleSearch}>
                  <Search className="mr-2" /> Search Rides
                </Button>
                <Button variant="secondary" className="w-full md:flex-1" onClick={() => setIsPostRideDialogOpen(true)}>
                  <PlusCircle className="mr-2" /> Post a Ride
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      
      {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardHeader>
                          <div className="flex items-center gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-24" />
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <Skeleton className="h-6 w-full" />
                         <Skeleton className="h-6 w-1/2" />
                      </CardContent>
                      <CardFooter>
                         <Skeleton className="h-10 w-full" />
                      </CardFooter>
                  </Card>
              ))}
          </div>
      ) : filteredRides.length === 0 ? (
        <Card className="flex items-center justify-center h-60">
            <CardContent className="text-center p-6">
              <Users className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No rides matching your search. Try adjusting your filters!</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredRides.map((ride) => (
            <Card key={ride.id} className="flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                    <Image 
                        src={getStaticMapUrl(ride.from, ride.to)}
                        alt={`Map from ${ride.from} to ${ride.to}`}
                        width={400}
                        height={250}
                        className="object-cover w-full h-48"
                        data-ai-hint="street map"
                    />
                     <div className="absolute top-3 right-3 flex items-center gap-2">
                        {ride.genderPreference === 'female' && (
                            <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
                                <User className="size-3 mr-1" /> Female Only
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                            <IndianRupee className="size-3 mr-1" /> {ride.price}
                        </Badge>
                         <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                           <Users className="size-3 mr-1.5"/> {ride.seats} seats
                        </Badge>
                    </div>
                </div>

                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/50">
                            <AvatarImage src={ride.driverPhotoUrl} alt={ride.driverName} data-ai-hint="person portrait" />
                            <AvatarFallback>{ride.driverName?.substring(0,2) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">{ride.driverName}</p>
                            <p className="text-xs text-muted-foreground">Verified Student</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Route className="size-5 text-primary" />
                        <p>{ride.from} → {ride.to}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>{format(new Date(ride.rideDate), "PPp")}</span>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button className="w-full" onClick={() => handleRequestJoin(ride)}>
                        Request to Join for ₹{ride.price}
                    </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
      <PostRideDialog open={isPostRideDialogOpen} onOpenChange={setIsPostRideDialogOpen} />
    </div>
  );
}
