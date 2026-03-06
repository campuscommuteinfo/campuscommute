"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Home,
    MapPin,
    AlertTriangle,
    Settings,
    Layers,
    Menu,
    X,
    TrendingUp,
} from 'lucide-react';
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Logo } from "@/components/logo";

const menuItems = [
    {
        href: '/admin',
        label: 'Overview',
        icon: LayoutDashboard,
    },
    {
        href: '/admin/users',
        label: 'Users',
        icon: Users,
    },
    {
        href: '/admin/rides',
        label: 'Rides',
        icon: Layers,
    },
    {
        href: '/admin/vehicles',
        label: 'Vehicles',
        icon: MapPin,
    },
    {
        href: '/admin/reports',
        label: 'Reports',
        icon: AlertTriangle,
    },
    {
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [isMobileWindow, setIsMobileWindow] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileWindow(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().role === "admin") {
                        setIsAdmin(true);
                        setAdminUser(user);
                    } else {
                        // Check for dev flag or specific emails ONLY in development mode
                        const isDevelopment = process.env.NODE_ENV === 'development';
                        const urlParams = new URLSearchParams(window.location.search);
                        const hasDevFlag = urlParams.get('dev') === 'true';
                        const hasAdminEmail = user.email?.includes('admin');

                        if (isDevelopment && (hasDevFlag || hasAdminEmail)) {
                            setIsAdmin(true);
                            setAdminUser(user);
                        } else {
                            setIsAdmin(false);
                            toast({
                                title: "Access Denied",
                                description: "Only administrators can access this area.",
                                variant: "destructive"
                            });
                            router.replace('/dashboard');
                        }
                    }
                } catch (error) {
                    console.error("Admin check error:", error);
                    setIsAdmin(false);
                    router.replace('/dashboard');
                }
            } else {
                router.replace('/login');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, toast]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logged out successfully.' });
            router.push('/login');
        } catch {
            toast({ title: 'Oops! Logout didn\'t work. Please try again.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-white">Authenticating Admin...</h1>
                    <p className="text-slate-400 text-sm mt-1">Please wait while we verify your access.</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    if (isMobileWindow) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Admin Panel Restricted</h1>
                <p className="text-slate-400 mb-8 max-w-sm">
                    For security and optimal viewing experience, the Admin Panel is only available on desktop devices. Please log in from a computer to access these tools.
                </p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
            {/* Top Navigation Bar - Horizontal Glassmorphism */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
                <div className="px-4 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <Link href="/admin">
                                <Logo size="sm" />
                            </Link>
                            <div className="hidden lg:block h-6 w-px bg-white/10 mx-1"></div>
                            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest text-indigo-400">Admin Panel</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1 ml-4 flex-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="hidden lg:flex items-center gap-4 ml-auto">
                            {/* System Stats Badge */}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">System Active</span>
                            </div>

                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                                <Home className="h-5 w-5" />
                            </Link>

                            {/* User Avatar & Logout */}
                            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                                    <AvatarImage src={adminUser?.photoURL || undefined} />
                                    <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                                        {adminUser?.displayName?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white leading-none mb-1">{adminUser?.displayName?.split(' ')[0] || 'Admin'}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-tighter text-left"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 ml-auto"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top duration-300">
                        <div className="px-4 py-6 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-4 rounded-xl text-base font-semibold transition-all",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
                                                : "text-slate-400 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-400"
                                >
                                    <Home className="h-4 w-4" />
                                    <span>View Site</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-red-500/10 text-red-400"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
