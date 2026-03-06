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
  MapPin,
  Ticket
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all relative group",
      isActive
        ? "text-indigo-600"
        : "text-slate-400 hover:text-slate-600"
    )}
  >
    {isActive && (
      <span className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl" />
    )}
    <Icon className={cn("w-5 h-5 relative z-10 transition-transform", isActive && "scale-105")} />
    <span className={cn("text-[9px] font-bold uppercase tracking-wider relative z-10", isActive ? "text-indigo-600" : "text-slate-500")}>{label}</span>
  </Link>
);

// Points card component
const PointsCard = ({ points, userName }: { points: number; userName: string }) => {
  const nextReward = 200;
  const progress = Math.min((points / nextReward) * 100, 100);
  const remaining = Math.max(nextReward - points, 0);

  return (
    <div className="relative group overflow-hidden rounded-3xl p-6 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 shadow-sm transition-all">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 p-0.5">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[10px] flex items-center justify-center overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="bg-transparent text-slate-900 dark:text-white text-lg font-bold">{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">Your ID</p>
              <p className="text-lg font-bold tracking-tight">{userName.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Trophy className="w-5 h-5 text-amber-500 mb-1.5" />
            <div className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-white/60">Silver Level</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Your Points</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                {points}
                <span className="text-[10px] text-slate-500">PTS</span>
              </p>
            </div>
            <div className="text-right pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Progress</p>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</p>
            </div>
          </div>

          <div className="bg-slate-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-wider mt-4 text-slate-500">
            {remaining > 0 ? (
              <>Unlock reward in <span className="text-indigo-600 dark:text-indigo-400">{remaining} points</span></>
            ) : (
              <span className="text-emerald-500">Claim your reward now! 🎉</span>
            )}
          </p>
        </div>
      </div>
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
    className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all group"
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", gradient.replace("shadow-", ""))}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors text-center">{label}</span>
  </Link>
);



export default function CommuteDashboard({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = React.useState(0);
  const [user, setUser] = React.useState<import("firebase/auth").User | null>(null);
  const [userName, setUserName] = React.useState("User");
  const [userPhoto, setUserPhoto] = React.useState("");
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  // Track if we've already redirected to prevent loops
  const hasRedirectedRef = React.useRef(false);

  React.useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setUserPhoto(currentUser.photoURL || "");
        const userDocRef = doc(db, "users", currentUser.uid);

        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (!isMounted) return;
          setIsLoading(false);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPoints(userData.points || 0);
            setUserName(userData.name || currentUser.displayName || "User");
            if (userData.role === 'admin') {
              setIsAdmin(true);
            }

            // Redirect to profile if incomplete (but only once)
            if (!userData.profileComplete && pathname !== "/dashboard/profile" && !hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              router.replace("/dashboard/profile");
            }
          } else {
            // Create user document if it doesn't exist
            setDoc(userDocRef, {
              points: 0,
              profileComplete: false,
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              createdAt: new Date().toISOString(),
            }).catch((error) => {
              console.error("Error creating user document:", error);
            });
          }
        }, (error) => {
          console.error("Firestore snapshot error:", error);
          if (isMounted) setIsLoading(false);
        });
      } else {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
          router.push("/login");
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [router, pathname]);



  const addPoints = async (amount: number, title: string, description: string) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    try {
      // Use transaction to prevent race conditions
      const { runTransaction } = await import("firebase/firestore");
      const newPoints = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User document not found");

        const currentPoints = userDoc.data().points || 0;
        const updatedPoints = currentPoints + amount;
        transaction.update(userDocRef, { points: updatedPoints });
        return updatedPoints;
      });

      toast({ title, description });

      // Check for reward unlock
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
    { href: "/dashboard/rewards", icon: Trophy, label: "Shop" },
    { href: "/dashboard/safety", icon: Shield, label: "Safety" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  // Pass addPoints to children that need it
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && pathname === "/dashboard") {
      return React.cloneElement(child, { addPoints } as { addPoints: (amount: number, title: string, description: string) => Promise<void> });
    }
    return child;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen-mobile bg-white dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading</p>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-600/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-600/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen-mobile bg-slate-100 dark:bg-slate-950 font-sans">
      <div className="flex flex-col w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl relative min-h-screen-mobile">
        {/* Top Header - Mobile Optimized */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 safe-top">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {userName.split(" ")[0]}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 ml-auto">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden xs:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-500/20"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Admin</span>
                </Link>
              )}
              <NotificationBell />
              <Link href="/dashboard/profile">
                <Avatar className="w-9 h-9 border border-slate-200 dark:border-white/10">
                  <AvatarImage src={userPhoto} alt={userName} />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32 safe-x lg:px-4">
          {/* Show points card only on dashboard home */}
          {pathname === "/dashboard" && (
            <div className="px-6 py-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <PointsCard points={points} userName={userName} />

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                <QuickAction
                  icon={MapPin}
                  label="Buses"
                  href="/dashboard"
                  gradient="bg-indigo-600"
                />
                <QuickAction
                  icon={Users}
                  label="Carpool"
                  href="/dashboard/ride-sharing"
                  gradient="bg-emerald-600"
                />
                <QuickAction
                  icon={Trophy}
                  label="Rewards"
                  href="/dashboard/rewards"
                  gradient="bg-amber-600"
                />
                <QuickAction
                  icon={Ticket}
                  label="My Rides"
                  href="/dashboard/my-rides"
                  gradient="bg-rose-600"
                />
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="px-6 py-2">
            {childrenWithProps}
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
          <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl px-2 py-1.5 flex items-center justify-around">
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
          </nav>
        </div>
      </div>
    </div>
  );
}
