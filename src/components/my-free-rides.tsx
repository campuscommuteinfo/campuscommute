
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Bus } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";

interface RedeemedRide {
    id: string;
    title: string;
    points: number;
    redeemedAt: any; // Firestore Timestamp
}

export default function MyFreeRides() {
    const [redeemedRides, setRedeemedRides] = React.useState<RedeemedRide[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState<any>(null);

     React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
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
    <div className="space-y-6">
       <Card>
        <CardHeader>
            <CardTitle>My Redeemed Rides</CardTitle>
            <CardDescription>
                Here are all the free ride vouchers you've collected. Use them on any eligible bus!
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <div className="mt-4 bg-white p-2 rounded-lg aspect-square flex items-center justify-center">
                                    <Skeleton className="h-32 w-full" />
                               </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
             ) : redeemedRides.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
                    <Ticket className="size-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Vouchers Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        You haven't redeemed any ride vouchers. Head over to the rewards page to get started.
                    </p>
                    <Link href="/dashboard/rewards">
                        <Button variant="outline">Go to Rewards</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {redeemedRides.map((ride) => (
                       <Card key={ride.id} className="bg-primary/5">
                           <CardHeader>
                               <div className="flex items-center gap-4">
                                   <div className="p-3 bg-primary/20 rounded-lg">
                                        <Bus className="size-6 text-primary" />
                                   </div>
                                   <div>
                                       <CardTitle className="text-primary">{ride.title}</CardTitle>
                                       <CardDescription>Valid on all ₹50 routes</CardDescription>
                                   </div>
                               </div>
                           </CardHeader>
                           <CardContent>
                               <p className="text-sm">
                                    Show this QR code to the conductor to redeem your free ride.
                               </p>
                               {/* Placeholder for QR Code */}
                               <div className="mt-4 bg-white p-2 rounded-lg aspect-square flex items-center justify-center">
                                    <p className="text-muted-foreground text-sm">QR Code Here</p>
                               </div>
                           </CardContent>
                       </Card>
                   ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
