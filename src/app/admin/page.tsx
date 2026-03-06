"use client";

import * as React from "react";
import {
    Users,
    Car,
    AlertTriangle,
    TrendingUp,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    Clock,
    Shield,
    Zap,
    Wallet,
    History,
    ChevronRight,
    Layers
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ElementType;
    trend?: number;
    color: string;
    onClick?: () => void;
}

const StatWidget = ({ title, value, subtext, icon: Icon, trend, color, onClick }: StatWidgetProps) => (
    <Card
        className={cn(
            "group overflow-hidden border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-500/20 cursor-pointer rounded-[2rem]",
            onClick && "active:scale-[0.98]"
        )}
        onClick={onClick}
    >
        <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div className={cn("p-3 rounded-2xl bg-slate-50 dark:bg-white/5 transition-colors group-hover:bg-indigo-600 group-hover:text-white shadow-sm")}>
                    <Icon className={cn("w-6 h-6 transition-colors", color, "group-hover:text-white")} />
                </div>
                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                        trend > 0
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                            : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
                    )}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
                <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                    {subtext}
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </p>
            </div>
        </CardContent>
    </Card>
);

const ChartMockup = () => (
    <div className="relative w-full h-[220px] mt-6 overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-end px-4 pb-4 shadow-inner">
        <div className="flex items-end justify-between w-full h-[70%] gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 75, 40, 60, 85, 70, 95].map((h, i) => (
                <div
                    key={i}
                    className="flex-1 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-t-lg transition-all hover:bg-gradient-to-t hover:from-indigo-600 hover:to-purple-500 hover:shadow-lg cursor-pointer relative group"
                    style={{ height: `${h}%` }}
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest z-20 shadow-xl border border-white/10">
                        {h * 2} Rides
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        activeRides: 0,
        totalVehicles: 0,
        totalLiquidity: 0,
        activeReports: 0
    });

    interface ActivityLog {
        id: string;
        type: string;
        title: string;
        detail: string;
        time: Date;
        icon: React.ElementType;
    }

    const [recentLogs, setRecentLogs] = React.useState<ActivityLog[]>([]);

    React.useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const totalLiquidity = snap.docs.reduce((acc, doc) => acc + (doc.data().walletBalance || 0), 0);
            setStats(prev => ({
                ...prev,
                totalUsers: snap.size,
                totalLiquidity
            }));
        });
        const unsubRides = onSnapshot(collection(db, "rides"), (snap) => {
            setStats(prev => ({ ...prev, activeRides: snap.size }));
        });
        const unsubVehicles = onSnapshot(collection(db, "vehicles"), (snap) => {
            setStats(prev => ({ ...prev, totalVehicles: snap.size }));
        });
        const unsubReports = onSnapshot(collection(db, "vehicle_reports"), (snap) => {
            setStats(prev => ({ ...prev, activeReports: snap.size }));
        });

        const recentActivityQuery = query(collection(db, "transactions"), orderBy("timestamp", "desc"), limit(6));
        const unsubLogs = onSnapshot(recentActivityQuery, (snap) => {
            const logs = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data.type,
                    title: data.type === 'recharge' ? 'Wallet Recharge' : data.type === 'payment' ? 'Ride Payment' : 'Reward Points',
                    detail: data.description,
                    time: data.timestamp?.toDate() || new Date(),
                    icon: data.type === 'recharge' ? Wallet : History
                };
            });
            setRecentLogs(logs);
        });

        return () => {
            unsubUsers();
            unsubRides();
            unsubVehicles();
            unsubReports();
            unsubLogs();
        };
    }, []);

    const logoGradient = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Cleaner Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-white/5 pb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Network Online</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">Admin Overview</h2>
                    <p className="text-slate-500 font-medium max-w-md">Simple insights into your campus transportation network.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatWidget
                    title="Total Funds"
                    value={`₹${stats.totalLiquidity.toLocaleString()}`}
                    subtext="Wallet Analytics"
                    icon={Wallet}
                    trend={12}
                    color="text-indigo-600"
                />
                <StatWidget
                    title="Live Rides"
                    value={stats.activeRides}
                    subtext="Monitor Trips"
                    icon={Car}
                    trend={4}
                    color="text-emerald-500"
                />
                <StatWidget
                    title="Help Alerts"
                    value={stats.activeReports}
                    subtext="Review Safety"
                    icon={AlertTriangle}
                    trend={-2}
                    color="text-pink-500"
                />
                <StatWidget
                    title="Active Users"
                    value={stats.totalUsers}
                    subtext="Manage Members"
                    icon={Users}
                    trend={8}
                    color="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Visual Analytics Card */}
                <Card className="lg:col-span-2 border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[2.5rem] overflow-hidden flex flex-col">
                    <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                                    <TrendingUp className="w-6 h-6 text-indigo-500" />
                                    Ride Trends
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium mt-2">Daily activity across the university routes.</CardDescription>
                            </div>
                            <Button size="sm" className={cn("h-10 rounded-[0.75rem] px-5 font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-indigo-500/20", logoGradient)}>
                                Download Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-8">
                        <div className="flex flex-col h-full justify-between">
                            <div className="grid grid-cols-3 gap-8 mb-10">
                                {[
                                    { label: "Rides/Hr", val: "14.2", col: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                                    { label: "Success Rate", val: "99.1%", col: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                                    { label: "Wait Time", val: "2.4m", col: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-500/10" }
                                ].map((item, i) => (
                                    <div key={i} className={cn("p-6 rounded-3xl border border-transparent transition-all hover:border-indigo-500/20", item.bg)}>
                                        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-2", item.col)}>{item.label}</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                            <ChartMockup />
                        </div>
                    </CardContent>
                </Card>

                {/* Simplified Activity Feed */}
                <div className="space-y-8">
                    <Card className="border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[2.5rem] overflow-hidden h-[480px] flex flex-col font-sans">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-xl font-black tracking-tight">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    Live Stream
                                </CardTitle>
                                <span className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            <div className="space-y-8">
                                {recentLogs.length > 0 ? recentLogs.map((log) => (
                                    <div key={log.id} className="flex gap-5 group relative">
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <log.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="absolute top-12 left-1/2 -ml-px w-px h-8 bg-slate-100 dark:bg-white/5 last:hidden" />
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{log.title}</h4>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                    {formatDistanceToNow(log.time, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 uppercase tracking-wide">{log.detail}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 px-6">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-white/10">
                                            <Clock className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Awaiting Activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Simple Utility Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <Button variant="outline" className="h-28 flex flex-col gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 hover:border-indigo-600/50 hover:bg-slate-50 dark:hover:bg-white/5 group transition-all shadow-sm active:scale-95">
                            <Shield className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Security</span>
                        </Button>
                        <Button variant="outline" className="h-28 flex flex-col gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 hover:border-purple-600/50 hover:bg-slate-50 dark:hover:bg-white/5 group transition-all shadow-sm active:scale-95">
                            <Layers className="w-6 h-6 text-slate-300 group-hover:text-purple-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">Logs</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
