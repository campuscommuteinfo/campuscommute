"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Shield,
  User,
  LogOut,
  Bell,
  MapPin,
  ChevronRight,
  Settings,
  Star,
  Ticket
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import NotificationBell from "./notification-bell";
import { cn } from "@/lib/utils";

// Mobile-first Bottom Navigation Item
const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all touch-target",
      isActive
        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
        : "text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
    <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{label}</span>
  </Link>
);

// Points card component
const PointsCard = ({ points, userName }: { points: number; userName: string }) => {
  const nextReward = 200;
  const progress = Math.min((points / nextReward) * 100, 100);
  const remaining = Math.max(nextReward - points, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="text-white/80 text-xs">Welcome back</p>
            <p className="font-semibold">{userName.split(" ")[0]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{points}</p>
          <p className="text-white/80 text-xs">Points</p>
        </div>
      </div>
      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/80 text-xs mt-2 text-center">
        {remaining > 0 ? `${remaining} pts to next reward` : "Reward unlocked! 🎉"}
      </p>
    </div>
  );
};

// Quick action button
const QuickAction = ({
  icon: Icon,
  label,
  href,
  gradient
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  gradient: string;
}) => (
  <Link
    href={href}
    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", gradient)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
  </Link>
);

// Menu item for profile/settings
const MenuItem = ({
  icon: Icon,
  label,
  href,
  onClick,
  badge,
  destructive = false
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  destructive?: boolean;
}) => {
  const content = (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl active:bg-gray-50 dark:active:bg-gray-700 transition-colors",
      destructive && "text-red-500"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        destructive ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-100 dark:bg-gray-700"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="flex-1 font-medium text-sm">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium">
          {badge}
        </span>
      )}
      {href && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
  }

  return href ? <Link href={href}>{content}</Link> : content;
};

export default function CommuteDashboard({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = React.useState(0);
  const [user, setUser] = React.useState<any>(null);
  const [userName, setUserName] = React.useState("User");
  const [userPhoto, setUserPhoto] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserPhoto(currentUser.photoURL || "");
        const userDocRef = doc(db, "users", currentUser.uid);

        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          setIsLoading(false);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPoints(userData.points || 0);
            setUserName(userData.name || currentUser.displayName || "User");
            if (!userData.profileComplete && pathname !== "/dashboard/profile") {
              router.replace("/dashboard/profile");
            }
          } else {
            setDoc(userDocRef, {
              points: 0,
              profileComplete: false,
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
            });
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setIsLoading(false);
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  const addPoints = async (amount: number, title: string, description: string) => {
    if (!user) return;

    const newPoints = points + amount;
    const userDocRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userDocRef, { points: newPoints });
      toast({ title, description });

      if (points < 200 && newPoints >= 200) {
        toast({
          variant: "default",
          title: "🎉 Reward Unlocked!",
          description: "You've earned a Free Ride!",
        });
      }
    } catch (error) {
      console.error("Failed to update points:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update your points.",
      });
    }
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/ride-sharing", icon: Users, label: "Rides" },
    { href: "/dashboard/rewards", icon: Trophy, label: "Rewards" },
    { href: "/dashboard/safety", icon: Shield, label: "Safety" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  // Pass addPoints to children that need it
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && pathname === "/dashboard") {
      return React.cloneElement(child, { addPoints } as any);
    }
    return child;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen-mobile bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Logo size="lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-xl opacity-50 animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen-mobile bg-gray-50 dark:bg-gray-900">
      {/* Top Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}</p>
              <p className="font-semibold text-gray-800 dark:text-white">{userName.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/dashboard/profile">
              <Avatar className="w-9 h-9 border-2 border-indigo-100">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 safe-x">
        {/* Show points card only on dashboard home */}
        {pathname === "/dashboard" && (
          <div className="px-4 py-4">
            <PointsCard points={points} userName={userName} />

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <QuickAction
                icon={MapPin}
                label="Track Bus"
                href="/dashboard"
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <QuickAction
                icon={Users}
                label="Find Ride"
                href="/dashboard/ride-sharing"
                gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              />
              <QuickAction
                icon={Trophy}
                label="Rewards"
                href="/dashboard/rewards"
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              />
              <QuickAction
                icon={Ticket}
                label="My Rides"
                href="/dashboard/my-rides"
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="px-4 py-2">
          {childrenWithProps}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Pattern */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 safe-bottom z-50">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
