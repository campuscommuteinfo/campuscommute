"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  Menu,
  X,
  Users,
  MapPin,
  ShieldCheck,
  Zap,
  Bus,
  ArrowRight,
  Star,
  CheckCircle2,
  CalendarDays,
  Smartphone,
  Navigation,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// Simplified Feature card
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) => (
  <div className="group p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-xl hover:border-indigo-500/20">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg", gradient)}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{description}</p>
  </div>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        // Dev fallback for immediate access
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isAdminEmail = currentUser.email?.toLowerCase().includes('admin') ||
          currentUser.email === 'misgemtre@gmail.com';

        if (isDevelopment && isAdminEmail) {
          setIsAdmin(true);
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (!isMounted) return;
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else if (!isDevelopment || !isAdminEmail) {
            setIsAdmin(false);
          }
        }, (error) => {
          console.error("[LandingPage] User doc listener error:", error);
          if (isMounted && (!isDevelopment || !isAdminEmail)) setIsAdmin(false);
        });
      } else {
        setIsAdmin(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoGradient = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className={cn(
        "fixed w-full top-0 z-[100] transition-all duration-300",
        scrolled ? "py-4" : "py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={cn(
            "flex items-center justify-between px-6 py-3 rounded-[1.5rem] transition-all duration-300",
            scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg" : "bg-transparent"
          )}>
            <Link href="/" className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Commute Companion</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'App'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {item}
                </Link>
              ))}
              {isAdmin && (
                <Button asChild variant="outline" className="hidden lg:flex items-center gap-2 rounded-xl h-10 px-4 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 hover:border-indigo-200 transition-all font-bold text-[10px] uppercase tracking-wider">
                  <Link href="/admin">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button asChild className={cn("rounded-xl h-10 px-6 font-bold text-white shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider", logoGradient)}>
                <Link href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Get Started"}</Link>
              </Button>
            </nav>

            <button className="md:hidden text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-48 pb-32 px-6 overflow-hidden">
          {/* Minimalist Orbs aligned with logo gradient */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

          <div className="max-w-5xl mx-auto text-center relative z-10">


            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-slate-900 dark:text-white mb-8 leading-[0.9] tracking-tighter">
              Ride Sharing.<br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Made Simple.
              </span>
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto mb-10 rounded-full opacity-50" />

            <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow students for easier, safer, and cheaper campus travel. One app for all your ride-pooling and bus tracking needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className={cn("h-16 rounded-[1.25rem] px-10 text-lg font-bold text-white shadow-xl active:scale-95 transition-all", logoGradient)}>
                <Link href="/login" className="flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-[1.25rem] px-8 text-lg font-bold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95">
                <Link href="#features">See How it Works</Link>
              </Button>
            </div>

            {/* Simple App Preview */}
            <div className="mt-24 relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent z-10" />
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-4 border border-slate-200 dark:border-white/10 shadow-2xl">
                <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden aspect-video sm:aspect-[21/9] flex items-center justify-center relative">
                  <div className="flex flex-col items-center gap-6 p-8">
                    <Navigation className="w-16 h-16 text-indigo-500 animate-pulse" />
                    <div className="space-y-4 text-center">
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Intelligent Live Tracking</h4>
                      <p className="text-slate-500 max-w-sm">Scan Knowledge Park routes and find the nearest available transport in seconds.</p>
                    </div>
                  </div>
                  {/* Fake UI Overlays */}
                  <div className="absolute top-8 left-8 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-white/5 hidden md:block animate-in slide-in-from-left-4 duration-1000">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bus 73A</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Arriving in 4m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Everything You Need.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Powerful features wrapped in a simple interface that anyone can use.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Easy Carpooling"
              description="Find rides from students going your way. Split costs effortlessly and meet new friends."
              gradient="bg-indigo-600"
            />
            <FeatureCard
              icon={MapPin}
              title="Real-time Tracking"
              description="Never miss a bus again. Live GPS tracking for all campus routes right on your phone."
              gradient="bg-purple-600"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Verified & Secure"
              description="Exclusively for verified university students. Safe, secure, and reliable travel."
              gradient="bg-pink-600"
            />
            <FeatureCard
              icon={Zap}
              title="Fast & Efficient"
              description="Book your ride with just two taps. No more waiting or browsing complex schedules."
              gradient="bg-amber-500"
            />
            <FeatureCard
              icon={CalendarDays}
              title="Smart Planning"
              description="Sync with your class schedule to automate your daily commute routine."
              gradient="bg-emerald-500"
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile First"
              description="Designed specifically for the mobile student lifestyle. Fast, light, and intuitive."
              gradient="bg-blue-500"
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6">
          <div className={cn("max-w-5xl mx-auto rounded-[3rem] p-12 sm:p-24 text-center text-white shadow-2xl relative overflow-hidden", logoGradient)}>
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative z-10 transition-transform active:scale-95 cursor-pointer">
              <h2 className="text-4xl sm:text-6xl font-black mb-8 leading-tight tracking-tight">Ready to Commute Smarter?</h2>
              <p className="text-white/80 text-lg sm:text-xl font-medium mb-12 max-w-xl mx-auto">Join the movement and simplify your campus life today.</p>
              <Button asChild className="h-16 bg-white hover:bg-slate-100 text-indigo-600 rounded-[1.25rem] px-12 text-lg font-bold shadow-xl">
                <Link href="/login">Launch App Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-slate-900 dark:text-white font-bold text-xl">Commute Companion</span>
          </div>
          <div className="flex gap-8">
            {['Home', 'Features', 'Safety', 'Support'].map(item => (
              <Link key={item} href="#" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">{item}</Link>
            ))}
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2025 Commute Companion Labs.
          </p>
        </div>
      </footer>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-12">
            <Logo size="md" />
            <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl">
              <X className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {['Home', 'Features', 'How it Works', 'App'].map(item => (
              <Link key={item} href="#" className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight" onClick={() => setIsMenuOpen(false)}>
                {item}
              </Link>
            ))}
            {isAdmin && (
              <Button asChild variant="outline" className="h-16 rounded-2xl text-lg font-bold border-indigo-100 text-indigo-600 shadow-sm mt-4">
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button asChild className={cn("h-16 rounded-2xl text-lg font-bold text-white shadow-xl mt-4", logoGradient)}>
              <Link href={user ? "/dashboard" : "/login"} onClick={() => setIsMenuOpen(false)}>{user ? "Go to Dashboard" : "Get Started"}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}