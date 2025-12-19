"use client";

import * as React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check, UserPlus, X } from "lucide-react";
import { onSnapshot, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface RideRequest {
    id: string;
    requesterName: string;
    status: string;
}

export default function NotificationBell() {
    const [user, setUser] = React.useState<User | null>(null);
    const [requests, setRequests] = React.useState<RideRequest[]>([]);
    const [open, setOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
    const { toast } = useToast();

    // Use ref to track previous request count to avoid stale closure
    const prevRequestCountRef = React.useRef(0);

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribeAuth();
    }, []);

    React.useEffect(() => {
        if (!user) {
            setRequests([]);
            return;
        }

        const q = query(
            collection(db, "ride_requests"),
            where("driverId", "==", user.uid),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newRequests: RideRequest[] = [];
            snapshot.forEach((docSnap) => {
                newRequests.push({ id: docSnap.id, ...docSnap.data() } as RideRequest);
            });

            // Only show notification for genuinely new requests
            if (newRequests.length > prevRequestCountRef.current && prevRequestCountRef.current > 0) {
                const latestRequest = newRequests[newRequests.length - 1];
                if (latestRequest) {
                    toast({
                        title: "New Ride Request!",
                        description: `${latestRequest.requesterName} wants to join your ride.`,
                    });
                }
            }
            prevRequestCountRef.current = newRequests.length;
            setRequests(newRequests);
        }, (error) => {
            console.error("Error fetching ride requests:", error);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAccept = async (requestId: string) => {
        if (isProcessing) return;
        setIsProcessing(requestId);

        try {
            const requestRef = doc(db, "ride_requests", requestId);
            await updateDoc(requestRef, { status: "accepted" });
            toast({ title: "Request Accepted!", description: "The student has been notified." });
        } catch (error) {
            console.error("Error accepting request:", error);
            toast({ variant: "destructive", title: "Failed", description: "Could not accept request." });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDecline = async (requestId: string) => {
        if (isProcessing) return;
        setIsProcessing(requestId);

        try {
            const requestRef = doc(db, "ride_requests", requestId);
            await updateDoc(requestRef, { status: "declined" });
            toast({ title: "Request Declined" });
        } catch (error) {
            console.error("Error declining request:", error);
            toast({ variant: "destructive", title: "Failed", description: "Could not decline request." });
        } finally {
            setIsProcessing(null);
        }
    };

    const unreadCount = requests.length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Ride Requests</CardTitle>
                        <CardDescription>
                            {unreadCount === 0
                                ? "No pending requests"
                                : `${unreadCount} pending request${unreadCount === 1 ? '' : 's'}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto">
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-sm text-muted-foreground">No new notifications</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <UserPlus className="size-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{req.requesterName}</p>
                                            <p className="text-xs text-muted-foreground">Wants to join your ride</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                                onClick={() => handleAccept(req.id)}
                                                disabled={isProcessing === req.id}
                                            >
                                                <Check className="size-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDecline(req.id)}
                                                disabled={isProcessing === req.id}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
