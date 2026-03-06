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
  Ticket,
  Zap
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
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
    )}
  >
    {isActive && (
      <span className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl" />
    )}
    <Icon className={cn("w-5 h-5 relative z-10 transition-transform", isActive && "scale-105")} />
    <span className={cn("text-[8px] font-black uppercase tracking-[0.15em] relative z-10", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>{label}</span>
  </Link>
);



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
    className="flex flex-col items-center gap-2 p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all active:scale-95 group"
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg text-white", gradient)}>
      <Icon className="w-7 h-7" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors text-center">{label}</span>
  </Link>
);



export default function CommuteDashboard({ children }: { children: React.ReactNode }) {

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





  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/ride-sharing", icon: Users, label: "Rides" },
    { href: "/dashboard/rewards", icon: Trophy, label: "Shop" },
    { href: "/dashboard/safety", icon: Shield, label: "Safety" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  const childrenWithProps = children;


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
          {/* Show quick actions on dashboard home */}
          {pathname === "/dashboard" && (
            <div className="px-6 py-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
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
