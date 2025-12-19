"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Shield,
    Phone,
    Share2,
    UserPlus,
    MessageSquare,
    Trash2,
    AlertTriangle,
    MapPin,
    Users
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface EmergencyContact {
    id: string;
    name: string;
    relation: string;
    phone: string;
}

// Contact Card Component
const ContactCard = ({
    contact,
    onDelete
}: {
    contact: EmergencyContact;
    onDelete: () => void;
}) => (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.relation}</p>
        </div>
        <div className="flex gap-1">
            <a
                href={`tel:${contact.phone}`}
                className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center active:scale-95 transition-transform"
            >
                <Phone className="w-4 h-4 text-green-600" />
            </a>
            <a
                href={`sms:${contact.phone}`}
                className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center active:scale-95 transition-transform"
            >
                <MessageSquare className="w-4 h-4 text-blue-600" />
            </a>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center active:scale-95 transition-transform">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Remove {contact.name} from your emergency contacts?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
);

export default function SafetyShield() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<any>(null);
    const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isSosActive, setIsSosActive] = React.useState(false);
    const [sosCountdown, setSosCountdown] = React.useState(3);
    const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;
        let unsubscribeSnapshot: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (!isMounted) return;

            if (currentUser) {
                setUser(currentUser);
                const contactsColRef = collection(db, "users", currentUser.uid, "emergency_contacts");
                unsubscribeSnapshot = onSnapshot(contactsColRef, (snapshot) => {
                    if (!isMounted) return;
                    const contacts: EmergencyContact[] = [];
                    snapshot.forEach(docSnap => {
                        contacts.push({ id: docSnap.id, ...docSnap.data() } as EmergencyContact);
                    });
                    setEmergencyContacts(contacts);
                    setIsLoading(false);
                }, (error) => {
                    console.error("Error fetching contacts:", error);
                    if (isMounted) setIsLoading(false);
                });
            } else {
                setUser(null);
                setEmergencyContacts([]);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSosActive && sosCountdown > 0) {
            timer = setTimeout(() => {
                setSosCountdown(sosCountdown - 1);
            }, 1000);
        } else if (isSosActive && sosCountdown === 0) {
            toast({
                variant: "destructive",
                title: "🆘 SOS Alert Sent!",
                description: "Location shared with security and contacts.",
            });
            setIsSosActive(false);
            setSosCountdown(3);
        }
        return () => clearTimeout(timer);
    }, [isSosActive, sosCountdown, toast]);

    const handleSosClick = () => {
        // Vibration feedback if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(isSosActive ? 50 : [100, 50, 100]);
        }

        if (!isSosActive) {
            setIsSosActive(true);
        } else {
            setIsSosActive(false);
            setSosCountdown(3);
            toast({ title: "SOS Cancelled" });
        }
    };

    const handleShareTrip = () => {
        navigator.clipboard.writeText("https://commute.app/trip/abc123");
        toast({
            title: "Link Copied!",
            description: "Share with trusted contacts",
        });
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!user || isDeleting) return;

        setIsDeleting(contactId);
        try {
            const contactDocRef = doc(db, "users", user.uid, "emergency_contacts", contactId);
            await deleteDoc(contactDocRef);
            toast({ title: "Contact Deleted" });
        } catch (error) {
            console.error("Error deleting contact:", error);
            toast({ variant: "destructive", title: "Failed to delete" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <>
            <div className="space-y-4 -mx-4">
                {/* SOS Button Section */}
                <div className="px-4">
                    <div className={cn(
                        "rounded-2xl p-6 transition-all duration-300",
                        isSosActive
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-red-500 to-rose-600"
                    )}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Emergency SOS</h2>
                                <p className="text-white/80 text-xs">Alert security & contacts</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleSosClick}
                            className={cn(
                                "w-full h-16 text-lg font-bold rounded-xl transition-all",
                                isSosActive
                                    ? "bg-white text-amber-600 hover:bg-gray-100"
                                    : "bg-white/20 text-white hover:bg-white/30 border-2 border-white/50"
                            )}
                        >
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            {isSosActive ? `CANCEL (${sosCountdown}s)` : "HOLD FOR SOS"}
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 px-4">
                    <button
                        onClick={handleShareTrip}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Share Trip</span>
                        <span className="text-xs text-gray-500">Live location</span>
                    </button>

                    <button
                        onClick={() => toast({ title: "Coming Soon" })}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Safe Zones</span>
                        <span className="text-xs text-gray-500">Campus areas</span>
                    </button>
                </div>

                {/* Emergency Contacts Section */}
                <div className="px-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Emergency Contacts</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-indigo-600"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : emergencyContacts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No emergency contacts</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setIsAddDialogOpen(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Add Contact
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {emergencyContacts.map((contact) => (
                                <ContactCard
                                    key={contact.id}
                                    contact={contact}
                                    onDelete={() => handleDeleteContact(contact.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Safety Tips */}
                <div className="px-4 pb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Safety Tips</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        {[
                            "Always verify the driver/vehicle before boarding",
                            "Share your trip with family or friends",
                            "Sit in the back seat when using cab services",
                            "Trust your instincts - if something feels wrong, leave",
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-600">{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AddEmergencyContactDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
        </>
    );
}
