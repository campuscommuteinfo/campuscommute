"use client";

import * as React from "react";
import {
    Search,
    Car,
    Activity,
    Battery,
    Wifi,
    Navigation2,
    RotateCcw,
    Circle,
    Info
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
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

interface Vehicle {
    id: string;
    name?: string;
    type?: string;
    number?: string;
    route?: string;
    status?: string;
}

export default function FleetMonitor() {
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "vehicles"), (snap) => {
            const vehicleData = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVehicles(vehicleData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredVehicles = vehicles.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.route?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tight text-white">Fleet <span className="text-indigo-500">Monitor</span></h2>
                    <p className="text-slate-400 font-medium">Real-time tracking and health status of campus-managed transit.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-5 rounded-2xl border-white/10 bg-white/5 text-slate-300 font-bold hover:bg-white/10">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Refresh Nodes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Fleet Online', value: vehicles.length, icon: Activity, color: 'text-emerald-400' },
                    { label: 'Avg occupancy', value: '68%', icon: Navigation2, color: 'text-indigo-400' },
                    { label: 'Energy Status', value: 'Optimal', icon: Battery, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5">
                        <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{stat.label}</p>
                            <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search fleet by name or route..."
                        className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Badge className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-slate-400 border flex items-center gap-2">
                        <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Telemetric Stream Active
                    </Badge>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-slate-400 font-black uppercase text-[10px] tracking-widest pl-8 h-14">Vehicle Entity</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Active Route</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Connectivity</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest h-14">Load Status</TableHead>
                            <TableHead className="text-right text-slate-400 font-black uppercase text-[10px] tracking-widest pr-8 h-14">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="h-48 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Syncing Sat-Data...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredVehicles.length > 0 ? (
                            filteredVehicles.map((vehicle) => (
                                <TableRow key={vehicle.id} className="hover:bg-white/5 border-white/5 transition-colors duration-300">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                                                <Car className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-100 uppercase tracking-tight">{vehicle.name}</span>
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                    {vehicle.type || 'Standard'} • {vehicle.number}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                            <span className="text-sm font-bold text-slate-300 tracking-tight">{vehicle.route || 'Idle'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border-none">
                                            <Circle className="w-2 h-2 fill-current mr-1.5 animate-pulse" />
                                            Live
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.random() * 80 + 20}%` }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 text-slate-400">
                                            <Info className="w-5 h-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-black uppercase text-xs tracking-widest border-none">
                                    No vehicles found in the fleet registry.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
