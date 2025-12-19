
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
import { Shield, MessageSquare, UserPlus, Phone, Share2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import AddEmergencyContactDialog from "./add-emergency-contact-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

export interface EmergencyContact {
    id: string;
    name: string;
    relation: string;
    phone: string;
}

export default function SafetyShield() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);
    const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isSosActive, setIsSosActive] = React.useState(false);
    const [sosCountdown, setSosCountdown] = React.useState(3);

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const contactsColRef = collection(db, "users", currentUser.uid, "emergency_contacts");
                const unsubscribeSnapshot = onSnapshot(contactsColRef, (snapshot) => {
                    const contacts: EmergencyContact[] = [];
                    snapshot.forEach(doc => {
                        contacts.push({ id: doc.id, ...doc.data() } as EmergencyContact);
                    });
                    setEmergencyContacts(contacts);
                    setIsLoading(false);
                });
                return () => unsubscribeSnapshot();
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSosActive && sosCountdown > 0) {
            timer = setTimeout(() => {
                setSosCountdown(sosCountdown - 1);
            }, 1000);
        } else if (isSosActive && sosCountdown === 0) {
            // Trigger the actual SOS alert
            toast({
                variant: "destructive",
                title: "🆘 SOS Alert Triggered!",
                description: "Your location has been shared with campus security and your emergency contacts.",
            });
            setIsSosActive(false); // Reset after triggering
            setSosCountdown(3);
        }
        return () => clearTimeout(timer);
    }, [isSosActive, sosCountdown, toast]);

    const handleSosClick = () => {
        if (!isSosActive) {
            setIsSosActive(true);
        } else {
            setIsSosActive(false);
            setSosCountdown(3);
            toast({ title: "SOS Cancelled", description: "The emergency alert has been cancelled." });
        }
    };


    const handleShareTrip = () => {
        navigator.clipboard.writeText("https://commute-companion.app/trip/jH8sK9lM");
        toast({
            title: "✅ Trip Link Copied!",
            description: "Share it with your trusted contacts to track your journey.",
        });
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!user) return;
        try {
            const contactDocRef = doc(db, "users", user.uid, "emergency_contacts", contactId);
            await deleteDoc(contactDocRef);
            toast({
                title: "Contact Deleted",
                description: "The emergency contact has been removed.",
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete the contact. Please try again.",
            });
        }
    }

  return (
    <>
        <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                <Shield className="text-destructive" />
                Emergency SOS
                </CardTitle>
                <CardDescription>
                    In case of an emergency, press and hold the SOS button to alert campus security and your contacts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    size="lg" 
                    className={cn(
                        "w-full h-16 text-lg transition-all duration-300",
                        isSosActive ? "bg-amber-500 hover:bg-amber-600" : "bg-destructive hover:bg-destructive/90"
                    )}
                    onClick={handleSosClick}
                >
                <Shield className="mr-2 size-8" /> 
                {isSosActive ? `CANCEL (${sosCountdown})` : "PRESS FOR SOS"}
                </Button>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                <Share2 className="text-primary"/>
                Virtual Travel Buddy
                </CardTitle>
                <CardDescription>
                    Share your live trip location with friends or family so they can follow your journey in real-time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" className="w-full h-16 text-lg" onClick={handleShareTrip}>
                <Share2 className="mr-2 size-8" /> Share My Live Trip
                </Button>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Manage Emergency Contacts</CardTitle>
            <CardDescription>
                Add trusted contacts who will be notified during an SOS alert.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                     <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : emergencyContacts.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                        <p>No emergency contacts added yet.</p>
                    </div>
                ) : (
                    emergencyContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${contact.name.charAt(0)}`} alt={contact.name} data-ai-hint="person smiling" />
                                    <AvatarFallback>{contact.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{contact.name}</p>
                                    <p className="text-sm text-muted-foreground">{contact.relation}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={`sms:${contact.phone}`}><MessageSquare className="size-4" /></a>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={`tel:${contact.phone}`}><Phone className="size-4" /></a>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to remove {contact.name} from your emergency contacts? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="mr-2" /> Add New Contact
                </Button>
            </CardFooter>
        </Card>
        </div>
        <AddEmergencyContactDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
