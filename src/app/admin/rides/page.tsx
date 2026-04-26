"use client";

import * as React from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Clock,
    MapPin,
    Users,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Navigation,
    Calendar,
    ArrowUpRight,
    LayoutGrid
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Ride {
    id: string;
    from?: string;
    to?: string;
    time?: string;
    driverName?: string;
    driverId?: string;
    occupiedSeats?: number;
    seats?: number;
    status?: string;
    createdAt?: any;
    vehicleType?: string;
}

export default function RideModeration() {
    const [rides, setRides] = React.useState<Ride[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, "rides"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            const ridesData = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRides(ridesData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredRides = rides.filter(ride =>
        ride.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.from?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'active': return "bg-emerald-500/10 text-emerald-600";
            case 'cancelled': return "bg-rose-500/10 text-rose-600";
            case 'completed': return "bg-indigo-500/10 text-indigo-600";
            default: return "bg-slate-500/10 text-slate-500";
        }
    };

    const logoGradient = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Simple Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-white/5 pb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Ride Oversight</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">Live Rides</h2>
                    <p className="text-slate-500 font-medium max-w-md">Monitor real-time student commutes and maintain campus safety.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white dark:bg-slate-950 border-slate-100 dark:border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm active:scale-95 transition-all">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Card View
                    </Button>
                </div>
            </div>

            {/* Simplified Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 dark:bg-white/5 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search by driver name, origin, or destination..."
                        className="pl-16 h-14 bg-white dark:bg-slate-900/50 border-0 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full sm:w-auto px-2">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 hover:text-indigo-600">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Clean Table Container */}
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <TableRow className="hover:bg-transparent border-none h-20">
                            <TableHead className="w-[350px] text-slate-400 font-black uppercase text-[10px] tracking-widest pl-12">Route Details</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Driver</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Seats</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                            <TableHead className="text-right pr-12 text-slate-400 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="h-96 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <div className="relative p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-full">
                                            <div className="w-16 h-16 border-4 border-indigo-500/10 rounded-full" />
                                            <div className="absolute inset-6 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin" />
                                        </div>
                                        <p className="text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase">Scanning Live Network...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRides.length > 0 ? (
                            filteredRides.map((ride) => (
                                <TableRow key={ride.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] border-slate-50 dark:border-white/[0.03] transition-all duration-300">
                                    <TableCell className="pl-12 py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                                    <Navigation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                                        {ride.from}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all scale-125" />
                                                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                                        {ride.to}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-[9px] text-slate-400 font-black tracking-[0.25em] ml-1 uppercase">
                                                <span className="flex items-center gap-2.5">
                                                    <Clock className="w-4 h-4 opacity-40" />
                                                    {ride.time || "Immediate"}
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                                                <span className="flex items-center gap-2.5">
                                                    <Calendar className="w-4 h-4 opacity-40" />
                                                    {format(new Date(ride.createdAt || Date.now()), "MMM d")}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1.5 group/pilot">
                                            <span className="text-[15px] font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover/pilot:text-indigo-600 transition-colors">
                                                {ride.driverName}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                                Mem ID: {ride.driverId?.slice(0, 6)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-white/5 py-2.5 px-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                                            <Users className="w-4 h-4 text-slate-300" />
                                            <span className="text-[15px] font-black text-slate-700 dark:text-slate-200">
                                                {ride.occupiedSeats || 0} <span className="text-slate-400 text-xs mx-0.5">/</span> {ride.seats}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn("text-[9px] font-black uppercase tracking-[0.25em] rounded-full px-4 py-2 border-0 shadow-sm", getStatusStyle(ride.status))}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                                            {ride.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-12">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button variant="ghost" size="icon" className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-500/10 active:scale-90 transition-all shadow-sm">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/10 active:scale-90 transition-all shadow-sm">
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-slate-800 text-slate-400 border border-slate-100 dark:border-white/5 active:scale-90 transition-all">
                                                <MoreVertical className="w-6 h-6" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-96 text-center text-slate-400 font-black uppercase text-xs tracking-[0.4em] border-none">
                                    No active trips found in the network.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
