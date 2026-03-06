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
    XCircle
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
            case 'active': return "bg-emerald-500/10 text-emerald-400";
            case 'cancelled': return "bg-rose-500/10 text-rose-400";
            case 'completed': return "bg-blue-500/10 text-blue-400";
            default: return "bg-slate-500/10 text-slate-400";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tight text-white">Ride <span className="text-indigo-500">Moderation</span></h2>
                    <p className="text-slate-400 font-medium">Monitor and manage community carpools and commute requests.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search by driver or destination..."
                        className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-slate-300 font-bold hover:bg-white/10">
                        <Filter className="w-4 h-4 mr-2" />
                        Status
                    </Button>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-slate-400 font-black uppercase text-[10px] tracking-widest pl-8 h-14">Route Details</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Driver Information</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Capacity</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                            <TableHead className="text-right text-slate-400 font-black uppercase text-[10px] tracking-widest pr-8 h-14">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="h-48 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Scanning Ride Grid...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRides.length > 0 ? (
                            filteredRides.map((ride) => (
                                <TableRow key={ride.id} className="hover:bg-white/5 border-white/5 transition-colors duration-300 group">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10">
                                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                                    {ride.from}
                                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                                    {ride.to}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black tracking-widest ml-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {ride.time || "Immediate"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-slate-200">{ride.driverName}</span>
                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">ID: {ride.driverId?.slice(0, 8)}...</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-500" />
                                            <span className="text-sm font-black text-slate-300">{ride.occupiedSeats || 0} / {ride.seats}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest rounded-full px-2.5 py-1", getStatusStyle(ride.status))}>
                                            {ride.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-400">
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white/10 text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-black uppercase text-xs tracking-widest border-none">
                                    No active rides found in the database.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
