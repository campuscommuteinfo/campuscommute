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
    History
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
}

const StatWidget = ({ title, value, subtext, icon: Icon, trend, color }: StatWidgetProps) => (
    <Card className="overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-white/5")}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
                {trend && (
                    <div className={cn("flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full", trend > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10")}>
                        {trend > 0 ? <ArrowUpRight className="w-2.5 h-2.5 mr-1" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
                <p className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                    {subtext}
                </p>
            </div>
        </CardContent>
    </Card>
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

        const recentActivityQuery = query(collection(db, "transactions"), orderBy("timestamp", "desc"), limit(5));
        const unsubLogs = onSnapshot(recentActivityQuery, (snap) => {
            const logs = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data.type,
                    title: data.type === 'recharge' ? 'Wallet Recharge' : data.type === 'payment' ? 'Ride Payment' : 'Point Conversion',
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Main Page</h2>
                    <p className="text-slate-500 text-sm font-medium">Check how the app and buses are doing right now.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget
                    title="Total Money"
                    value={`₹${stats.totalLiquidity}`}
                    subtext="All money in user wallets"
                    icon={Wallet}
                    trend={15}
                    color="text-indigo-400"
                />
                <StatWidget
                    title="Active Ride Shares"
                    value={stats.activeRides}
                    subtext="Live community pools"
                    icon={TrendingUp}
                    trend={5}
                    color="text-emerald-400"
                />
                <StatWidget
                    title="All Buses"
                    value={stats.totalVehicles}
                    subtext="Buses moving right now"
                    icon={Activity}
                    color="text-slate-400"
                />
                <StatWidget
                    title="Total App Users"
                    value={stats.totalUsers}
                    subtext="People using the app"
                    icon={Users}
                    trend={12}
                    color="text-blue-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-lg">
                                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    What is happening now?
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-xs font-medium mt-1">Check new events in the app</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {recentLogs.length > 0 ? recentLogs.map((log) => (
                                <div key={log.id} className="flex gap-4 group relative">
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center transition-all">
                                            <log.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <div className="absolute top-10 left-1/2 -ml-px w-px h-6 bg-slate-100 dark:bg-white/5 last:hidden" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{log.title}</h4>
                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatDistanceToNow(log.time, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.detail}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Activity className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Recent Activity Detected</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Status / Quick Links */}
                <div className="space-y-6">
                    <Card className="border border-indigo-100 dark:border-indigo-500/20 bg-indigo-600 shadow-sm overflow-hidden relative">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white text-lg">Admin Tools</CardTitle>
                            <CardDescription className="text-indigo-100/70 text-xs font-medium">Manage the app</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 relative z-10">
                            {[
                                { label: 'Verify Drivers', icon: Users, color: 'bg-white/10' },
                                { label: 'Add Route', icon: MapPin, color: 'bg-white/10' },
                                { label: 'Emergency Override', icon: AlertTriangle, color: 'bg-rose-500/20' }
                            ].map((item, i) => (
                                <button key={i} className={cn("w-full flex items-center justify-between p-3.5 hover:bg-white/20 rounded-xl transition-all group border border-white/5", item.color)}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-white" />
                                        <span className="text-xs font-bold text-white tracking-tight">{item.label}</span>
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-slate-900 dark:text-white text-base">Is it working?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Database Node', status: 'Healthy', color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'XAI Engine', status: 'Stable', color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'Notification Pipe', status: '2 Delayed', color: 'text-amber-600 dark:text-amber-400' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-semibold">{item.label}</span>
                                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg", item.color.replace('text-', 'bg-').concat('/10 '), item.color)}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
