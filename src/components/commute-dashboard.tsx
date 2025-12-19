
"use client";

import * as React from "react";
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  LogOut,
  Ticket,
  Shield,
  LayoutDashboard,
  User,
  Users,
  Trophy,
} from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";

import { Logo } from "@/components/logo";
import NotificationBell from "./notification-bell";

export default function CommuteDashboard({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = React.useState(0);
  const [user, setUser] = React.useState<any>(null);
  const [userName, setUserName] = React.useState("User");
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);

        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          setIsLoading(false);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPoints(userData.points || 0);
            setUserName(userData.name || "User");
            if (!userData.profileComplete && pathname !== '/dashboard/profile') {
              router.replace('/dashboard/profile');
            }
          } else {
            setDoc(userDocRef, { points: 0, profileComplete: false });
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setIsLoading(false);
        setUser(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, pathname]);


  const nextReward = { name: "Free Ride", points: 200 };
  const progress = Math.min((points / nextReward.points) * 100, 100);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
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
      
      toast({
        title,
        description,
      });

      if (points < nextReward.points && newPoints >= nextReward.points) {
        toast({
          variant: "default",
          title: "🎉 Reward Unlocked! 🎉",
          description: `You've earned a ${nextReward.name}!`,
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
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/ride-sharing", icon: Users, label: "Ride-Sharing" },
    { href: "/dashboard/rewards", icon: Trophy, label: "Rewards" },
    { href: "/dashboard/my-rides", icon: Ticket, label: "My Free Rides" },
    { href: "/dashboard/safety", icon: Shield, label: "Safety Shield" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  // Pass addPoints to children that need it
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // A bit of a hack, but for this specific architecture it works.
      // We know DashboardPage needs this prop.
      if (pathname === '/dashboard') {
        return React.cloneElement(child, { addPoints } as any);
      }
    }
    return child;
  });

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
              <Logo />
              <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-xl font-semibold font-headline">Commute Companion</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                 <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(item.href) && item.href !== "/dashboard" || pathname === item.href}>
                    <item.icon />
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="p-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${userName.charAt(0)}`} alt={userName} data-ai-hint="student smiling" />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    Gold Tier
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <CardTitle className="text-2xl">{points.toLocaleString()} pts</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Next: {nextReward.name}
                    </p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                    {nextReward.points - points > 0 ? `${nextReward.points - points} points to your next reward!` : "You've unlocked a new reward!"}
                </p>
              </div>
               <div className="mt-4 space-y-2">
                 <Link href="/dashboard/rewards" passHref>
                   <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Gift className="text-accent" />
                      <span>Redeem Vouchers</span>
                   </Button>
                 </Link>
                 <Link href="/dashboard/my-rides" passHref>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Ticket className="text-primary" />
                        <span>My Free Rides</span>
                    </Button>
                  </Link>
               </div>
            </CardContent>
          </Card>
           <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut />
            Log Out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
             <SidebarTrigger />
             <h2 className="text-lg font-semibold font-headline hidden sm:block">
                Welcome Back, {userName.split(' ')[0]}!
             </h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/dashboard/ride-sharing" passHref>
              <Button size="sm">
                  Find a Ride
                  <Users className="ml-2" />
                </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {childrenWithProps}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
