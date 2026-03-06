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
    Users,
    Siren,
    Radio
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import AddEmergencyContactDialog from "./add-emergency-contact-dialog";
import { broadcastSOS, cancelSOS } from "@/app/actions/sosActions";
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
    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 group">
        <Avatar className="w-10 h-10 border border-slate-100 dark:border-white/10">
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs">
                {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate uppercase tracking-tight">{contact.name}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{contact.relation}</p>
        </div>
        <div className="flex gap-2">
            <a
                href={`tel:${contact.phone}`}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-emerald-500/20"
            >
                <Phone className="w-4 h-4 text-emerald-600" />
            </a>
            <a
                href={`sms:${contact.phone}`}
                className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-indigo-500/20"
            >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
            </a>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center active:scale-95 transition-transform">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold">Delete Connection?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 font-medium">
                            Remove {contact.name} from your help list?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold uppercase tracking-wider text-xs">
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
);

export default function SafetyShield() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isSosActive, setIsSosActive] = React.useState(false);
    const [sosCountdown, setSosCountdown] = React.useState(3);
    const [activeAlertId, setActiveAlertId] = React.useState<string | null>(null);
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
            // Get location and broadcast
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const token = await user?.getIdToken();
                    const result = await broadcastSOS(
                        token!,
                        user?.uid || "anonymous",
                        user?.displayName || "Anonymous User",
                        latitude,
                        longitude
                    );

                    if (result.success) {
                        setActiveAlertId(result.alertId!);
                        toast({
                            variant: "destructive",
                            title: "🆘 HELP REQUEST SENT",
                            description: "Your location has been sent to the help team.",
                            className: "bg-rose-600 border-none text-white font-bold"
                        });
                    }
                }, (error) => {
                    console.error("Geolocation error:", error);
                    toast({
                        variant: "destructive",
                        title: "Signal Weak",
                        description: "Could not find your location, but help is notified."
                    });
                });
            }

            setIsSosActive(false);
            setSosCountdown(3);
        }
        return () => clearTimeout(timer);
    }, [isSosActive, sosCountdown, toast, user]);

    const handleSosClick = async () => {
        // Connectivity check
        if (!navigator.onLine && !isSosActive) {
            toast({
                variant: "destructive",
                title: "OFFLINE MODE",
                description: "Cannot broadcast SOS without internet. Please call local emergency services.",
                className: "bg-rose-900 border-none text-white font-bold"
            });
            return;
        }

        // Vibration feedback if supported
        if ('vibrate' in navigator) {
            navigator.vibrate(isSosActive ? 50 : [100, 50, 100]);
        }

        if (!isSosActive) {
            setIsSosActive(true);
        } else {
            setIsSosActive(false);
            setSosCountdown(3);

            if (activeAlertId && user) {
                const token = await user.getIdToken();
                await cancelSOS(token, activeAlertId, user.uid);
                setActiveAlertId(null);
            }

            toast({ title: "Help Cancelled", className: "bg-emerald-500 border-none text-white font-bold" });
        }
    };

    const handleShareTrip = () => {
        const beaconUrl = `${window.location.origin}/trip/${user?.uid || 'guest'}-${Date.now()}`;
        navigator.clipboard.writeText(beaconUrl);
        toast({
            title: "LINK COPIED",
            description: "Share this with people you trust.",
            className: "bg-slate-900 border-white/10 text-white font-black uppercase tracking-widest text-xs"
        });
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!user || isDeleting) return;

        setIsDeleting(contactId);
        try {
            const contactDocRef = doc(db, "users", user.uid, "emergency_contacts", contactId);
            await deleteDoc(contactDocRef);
            toast({ title: "Person Removed", className: "bg-slate-900 border-white/10 text-white font-bold" });
        } catch (error) {
            console.error("Error deleting contact:", error);
            toast({ variant: "destructive", title: "Failed to disconnect" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SOS Button Section */}
            <div>
                <div className={cn(
                    "rounded-3xl p-8 transition-all duration-300 relative overflow-hidden border cursor-pointer",
                    isSosActive
                        ? "bg-rose-600 border-rose-500"
                        : "bg-slate-900 border-slate-800"
                )} onClick={handleSosClick}>
                    {isSosActive && (
                        <>
                            <div className="absolute inset-0 bg-rose-500 animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/30 rounded-full blur-3xl animate-ping" />
                        </>
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center gap-4">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                            isSosActive ? "bg-white text-rose-600" : "bg-white/5 text-rose-500"
                        )}>
                            {isSosActive ? (
                                <span className="text-4xl font-black">{sosCountdown}</span>
                            ) : (
                                <Siren className="w-10 h-10 animate-pulse" />
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                                {isSosActive ? "Requesting Help..." : "Get Help Now"}
                            </h2>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mt-1">
                                {isSosActive ? "Tap to cancel" : "Tap for emergency help"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleShareTrip}
                    className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 active:scale-95 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center transition-transform">
                        <Share2 className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="text-center">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Help Link</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Share Location</span>
                    </div>
                </button>

                <button
                    onClick={() => toast({ title: "COMING SOON", className: "bg-slate-900 text-white font-bold" })}
                    className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 active:scale-95 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-transform">
                        <Radio className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-center">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Safe Zones</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Safe Areas</span>
                    </div>
                </button>
            </div>

            {/* Emergency Contacts Section */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-5 px-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        Trusted People
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-indigo-600 font-bold uppercase tracking-wider text-[9px] hover:bg-white dark:hover:bg-white/5 rounded-lg h-8"
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        <UserPlus className="w-3 h-3 mr-1.5" />
                        Add Person
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-20 bg-white dark:bg-white/5 rounded-[1.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : emergencyContacts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5">
                        <Shield className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">No Trusted People</p>
                        <p className="text-[10px] text-slate-500 mb-4">Add people you trust for safety.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg font-bold uppercase tracking-wider text-[9px] border-slate-200 dark:border-white/10"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <UserPlus className="w-3 h-3 mr-2" />
                            Add
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
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
            <div className="px-6 pb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Safety Rules
                </h3>
                <div className="space-y-4">
                    {[
                        "Check driver and car before you get in",
                        "Keep your location link on while traveling",
                        "Sit in the back seat",
                        "Stop immediately if anything feels wrong",
                    ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 group">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <span className="text-[10px] font-black text-indigo-600 group-hover:text-white">{i + 1}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            <AddEmergencyContactDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
        </div>
    );
}
