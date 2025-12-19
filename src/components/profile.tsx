"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    User,
    LogOut,
    ChevronRight,
    BadgeCheck,
    Settings,
    Shield,
    Bell,
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
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
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
            "w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 active:bg-gray-50 dark:active:bg-gray-700 transition-colors",
            destructive && "text-red-500"
        )}
    >
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            destructive ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-100 dark:bg-gray-700"
        )}>
            <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1 font-medium text-sm text-left">{label}</span>
        {value && <span className="text-sm text-gray-500">{value}</span>}
        {showArrow && !value && <ChevronRight className="w-5 h-5 text-gray-400" />}
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
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
            <p className="font-medium text-sm text-gray-800 dark:text-white">{label}</p>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);

export default function Profile() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);
    const [userData, setUserData] = React.useState<any>({});
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
                description: "You have been successfully logged out.",
            });
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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
                description: "Your account has been permanently deleted.",
            });
            router.push('/');
        } catch (error) {
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
        <div className="space-y-4 -mx-4">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="w-20 h-20 border-4 border-white/30">
                            <AvatarImage src={user?.photoURL || ""} alt={userData.name || "User"} />
                            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                                {(userData.name || user?.displayName || "U").charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95">
                            <Camera className="w-4 h-4 text-indigo-600" />
                        </button>
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                                    autoFocus
                                />
                                <button onClick={handleSaveName} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white">{userData.name || user?.displayName || "User"}</h1>
                                <button onClick={() => setIsEditing(true)} className="p-1">
                                    <Edit2 className="w-4 h-4 text-white/70" />
                                </button>
                            </div>
                        )}
                        <p className="text-white/80 text-sm">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                                <BadgeCheck className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">Verified</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
                                <Star className="w-3 h-3 text-yellow-300" />
                                <span className="text-xs text-white">{userData.points || 0} pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Preferences Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mx-4 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-800 dark:text-white">Ride Preferences</h2>
                </div>
                <ToggleItem
                    icon={Users}
                    label="Female Only Rides"
                    description="Only match with female riders"
                    checked={userData.genderPreference === "female"}
                    onCheckedChange={(checked) => handleToggle("genderPreference", checked ? "female" : "any" as any)}
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

            {/* Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mx-4 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-800 dark:text-white">Settings</h2>
                </div>
                <MenuItem icon={Bell} label="Notifications" onClick={() => toast({ title: "Coming Soon" })} />
                <MenuItem icon={Shield} label="Privacy & Security" onClick={() => toast({ title: "Coming Soon" })} />
                <MenuItem icon={HelpCircle} label="Help & Support" onClick={() => toast({ title: "Coming Soon" })} />
                <MenuItem icon={FileText} label="Terms & Conditions" onClick={() => toast({ title: "Coming Soon" })} />
            </div>

            {/* Logout Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mx-4 shadow-sm">
                <MenuItem
                    icon={LogOut}
                    label="Log Out"
                    onClick={handleSignOut}
                    destructive
                    showArrow={false}
                />
            </div>

            {/* Danger Zone */}
            <div className="mx-4 mb-8">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4 rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. All your data will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* App Version */}
            <div className="text-center pb-8">
                <p className="text-xs text-gray-400">Commute Companion v1.0.0</p>
            </div>
        </div>
    );
}
