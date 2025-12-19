
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
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
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribeAuth();
    }, []);

    React.useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "ride_requests"),
            where("driverId", "==", user.uid),
            where("status", "==", "pending")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newRequests: RideRequest[] = [];
            snapshot.forEach((doc) => {
                newRequests.push({ id: doc.id, ...doc.data() } as RideRequest);
            });
            if (newRequests.length > requests.length) {
                toast({
                    title: "New Ride Request!",
                    description: `${newRequests[newRequests.length - 1].requesterName} wants to join your ride.`,
                });
            }
            setRequests(newRequests);
        });

        return () => unsubscribe();

    }, [user, requests.length, toast]);

    const handleAccept = async (requestId: string) => {
        const requestRef = doc(db, "ride_requests", requestId);
        await updateDoc(requestRef, { status: "accepted" });
        toast({ title: "Request Accepted!", description: "The student has been notified." });
    }
    
    const handleDecline = async (requestId: string) => {
         const requestRef = doc(db, "ride_requests", requestId);
        await updateDoc(requestRef, { status: "declined" });
        toast({ title: "Request Declined" });
    }

    const unreadCount = requests.filter(r => r.status === 'pending').length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <Card>
                    <CardHeader>
                        <CardTitle>Ride Requests</CardTitle>
                        <CardDescription>You have {unreadCount} pending request{unreadCount === 1 ? '' : 's'}.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto">
                        {requests.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">No new notifications.</p>
                        ) : (
                            <div className="space-y-4">
                               {requests.map(req => (
                                   <div key={req.id} className="flex items-center gap-4">
                                        <UserPlus className="size-6 text-primary" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{req.requesterName}</p>
                                            <p className="text-xs text-muted-foreground">Wants to join your ride.</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => handleAccept(req.id)}>
                                                <Check className="size-4" />
                                            </Button>
                                             <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDecline(req.id)}>
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
