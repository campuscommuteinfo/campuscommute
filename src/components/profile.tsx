"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    LogOut,
    ChevronRight,
    BadgeCheck,
    Shield,
    HelpCircle,
    FileText,
    Trash2,
    Camera,
    Star,
    Edit2,
    Check,
    X,
    Music,
    Cigarette,
    Users,
    Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, deleteUser, User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

// Menu item component
const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    value,
    destructive = false,
    showArrow = true
}: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    value?: string;
    destructive?: boolean;
    showArrow?: boolean;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 active:scale-[0.99] transition-all group",
            destructive && "text-rose-500"
        )}
    >
        <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shadow-sm",
            destructive ? "bg-rose-50 dark:bg-rose-900/20 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
        )}>
            <Icon className={cn("w-4.5 h-4.5", destructive ? "text-rose-500" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500")} />
        </div>
        <span className={cn("flex-1 font-bold text-sm text-left tracking-tight", destructive ? "text-rose-600" : "text-slate-900 dark:text-white")}>{label}</span>
        {value && <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">{value}</span>}
        {showArrow && !value && <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />}
    </button>
);

// Toggle item component
const ToggleItem = ({
    icon: Icon,
    label,
    description,
    checked,
    onCheckedChange
}: {
    icon: React.ElementType;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) => (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 group">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors shadow-sm">
            <Icon className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500" />
        </div>
        <div className="flex-1">
            <p className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">{label}</p>
            {description && <p className="text-[10px] text-slate-400 font-medium">{description}</p>}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-indigo-600" />
    </div>
);

export default function Profile() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [userData, setUserData] = React.useState<{
        name?: string;
        points?: number;
        genderPreference?: string;
        isSmokingAllowed?: boolean;
        isMusicAllowed?: boolean;
        [key: string]: unknown;
    }>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editName, setEditName] = React.useState("");

    React.useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!isMounted) return;

            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (isMounted && userDoc.exists()) {
                        setUserData(userDoc.data());
                        setEditName(userDoc.data().name || currentUser.displayName || "");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                router.push('/login');
                return;
            }
            if (isMounted) setIsLoading(false);
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
            toast({
                title: "Logged Out",
                description: "You have been logged out.",
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Logout Failed",
                description: "Could not log you out. Please try again.",
            });
        }
    };

    const handleSaveName = async () => {
        if (!user || !editName.trim()) return;
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { name: editName, profileComplete: true });
            setUserData({ ...userData, name: editName });
            setIsEditing(false);
            toast({ title: "Name Updated", description: "Your name has been saved." });
        } catch {
            toast({ variant: "destructive", title: "Update Failed" });
        }
    };

    const handleToggle = async (field: string, value: boolean | string) => {
        if (!user) return;

        // Optimistic update
        const previousValue = userData[field];
        setUserData({ ...userData, [field]: value });

        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { [field]: value });
        } catch {
            // Revert on error
            setUserData({ ...userData, [field]: previousValue });
            toast({ variant: "destructive", title: "Update Failed" });
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteUser(user);
            toast({
                variant: "destructive",
                title: "Account Deleted",
                description: "Your account has been deleted.",
            });
            router.push('/');
        } catch {
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Please log out and log back in to delete your account.",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header */}
            <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 -mx-6 px-6 pb-8 pt-6 rounded-b-[2rem] shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -ml-16 -mb-16" />

                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-slate-900 dark:border-slate-950 relative shadow-xl">
                            <AvatarImage src={user?.photoURL || ""} alt={userData.name || "User"} />
                            <AvatarFallback className="bg-slate-800 text-white text-3xl font-bold">
                                {(userData.name || user?.displayName || "U").charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-1 right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 hover:bg-indigo-700 transition-colors border-2 border-slate-900 dark:border-slate-950">
                            <Camera className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>

                    <div className="w-full max-w-xs">
                        {isEditing ? (
                            <div className="flex items-center gap-2 justify-center">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-center font-bold rounded-xl"
                                    autoFocus
                                />
                                <button onClick={handleSaveName} className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500/30 transition-colors">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="w-9 h-9 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/20 hover:bg-rose-500/30 transition-colors">
                                    <X className="w-4 h-4 text-rose-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 justify-center">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{userData.name || user?.displayName || "User"}</h1>
                                <button onClick={() => setIsEditing(true)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        )}
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">{user?.email}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <BadgeCheck className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">{userData.points || 0} Points</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Preferences Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" />
                        Ride Options
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    <ToggleItem
                        icon={Users}
                        label="Female Only"
                        description="Strict matching with verified female riders"
                        checked={userData.genderPreference === "female"}
                        onCheckedChange={(checked) => handleToggle("genderPreference", checked ? "female" : "any")}
                    />
                    <ToggleItem
                        icon={Cigarette}
                        label="Smoking Allowed"
                        checked={userData.isSmokingAllowed || false}
                        onCheckedChange={(checked) => handleToggle("isSmokingAllowed", checked)}
                    />
                    <ToggleItem
                        icon={Music}
                        label="Music Allowed"
                        checked={userData.isMusicAllowed !== false}
                        onCheckedChange={(checked) => handleToggle("isMusicAllowed", checked)}
                    />
                </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        App Settings
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    <MenuItem icon={Shield} label="Privacy & Security" onClick={() => toast({ title: "Coming Soon" })} />
                    <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => toast({ title: "Coming Soon" })} />
                    <MenuItem icon={FileText} label="Terms & Conditions" onClick={() => toast({ title: "Coming Soon" })} />
                </div>
            </div>

            {/* Logout Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                <MenuItem
                    icon={LogOut}
                    label="Log Out"
                    onClick={handleSignOut}
                    destructive
                    showArrow={false}
                />
            </div>

            {/* Danger Zone */}
            <div className="px-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 uppercase tracking-wider">
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4 rounded-3xl bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-[calc(100%-2rem)]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-bold">Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                This action cannot be undone. All your data will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row gap-2">
                            <AlertDialogCancel className="rounded-lg border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white mt-0 flex-1">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-rose-600 hover:bg-rose-700 rounded-lg font-bold uppercase tracking-wider text-[10px] flex-1"
                            >
                                Confirm Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* App Version */}
            <div className="text-center pb-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">Campus Commute v1.0.0</p>
            </div>
        </div>
    );
}
