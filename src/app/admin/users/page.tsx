"use client";

import * as React from "react";
import {
    Search,
    UserPlus,
    ShieldCheck,
    MoreVertical,
    Mail,
    Calendar,
    Trophy,
    ShieldAlert,
    IndianRupee,
    Briefcase,
    Zap,
    Download
} from "lucide-react";
import { db } from "@/lib/firebase";
import ManualRechargeModal from "@/components/admin/manual-recharge-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Commuter {
    id: string;
    name?: string;
    email?: string;
    photoURL?: string;
    role?: string;
    points?: number;
    walletBalance?: number;
    profileComplete?: boolean;
    createdAt?: any;
    lastActive?: any;
}

export default function UserManagement() {
    const [users, setUsers] = React.useState<Commuter[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedUser, setSelectedUser] = React.useState<Commuter | null>(null);
    const [isRechargeOpen, setIsRechargeOpen] = React.useState(false);

    React.useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            const usersData = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const logoGradient = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Simple Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-white/5 pb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Member Registry</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">All Users</h2>
                    <p className="text-slate-500 font-medium max-w-md">Manage campus members, community points, and wallet balances in one place.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white dark:bg-slate-950 border-slate-100 dark:border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm active:scale-95 transition-all">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button className={cn("h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/10 active:scale-95 transition-all border-0", logoGradient)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Simplified Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 dark:bg-white/5 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search for a name or email address..."
                        className="pl-16 h-14 bg-white dark:bg-slate-900/50 border-0 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full sm:w-auto px-2">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 hover:text-indigo-600">Filters</Button>
                </div>
            </div>

            {/* Clean Table Container */}
            <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <TableRow className="hover:bg-transparent border-none h-20">
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest pl-12">User</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Verification</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Points</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Wallet</TableHead>
                            <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest pl-8">Joined</TableHead>
                            <TableHead className="text-right pr-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={6} className="h-96 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <div className="relative p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-full">
                                            <div className="w-16 h-16 border-4 border-indigo-500/10 rounded-full" />
                                            <div className="absolute inset-6 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin" />
                                        </div>
                                        <p className="text-slate-400 font-black tracking-[0.3em] text-[10px] uppercase">Reviewing Member Records...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] border-slate-50 dark:border-white/[0.03] transition-all duration-300">
                                    <TableCell className="pl-12 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <Avatar className="w-14 h-14 border-2 border-slate-100 dark:border-white/10 rounded-2xl shadow-sm group-hover:scale-105 transition-transform group-hover:rotate-1">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback className="bg-indigo-600 text-white font-black text-lg rounded-2xl">
                                                        {user.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.role === 'admin' && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 rounded-lg p-1.5 shadow-xl border-2 border-white dark:border-slate-900 ring-2 ring-indigo-500/20">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {user.name || "Anonymous Member"}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-bold flex items-center gap-2 lowercase tracking-wide">
                                                    <Mail className="w-3.5 h-3.5 opacity-50" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Badge variant={user.profileComplete ? "default" : "secondary"} className={cn("inline-flex w-fit text-[9px] h-6 px-3 rounded-full font-black uppercase tracking-widest border-0", user.profileComplete ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-400")}>
                                                {user.profileComplete ? "Verified" : "Pending"}
                                            </Badge>
                                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest pl-1">
                                                {user.role || 'Commuter'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                                                <Trophy className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{user.points || 0}</span>
                                                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Points</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div
                                            className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner"
                                        >
                                            <IndianRupee className="w-4 h-4 text-indigo-500" />
                                            <span className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                                                ₹{(user.walletBalance || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-3 text-[12px] text-slate-400 font-bold tracking-tight">
                                            <Calendar className="w-5 h-5 opacity-40" />
                                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-12">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-indigo-600 transition-all">
                                                    <MoreVertical className="w-6 h-6" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl w-64 shadow-2xl p-3 pb-4">
                                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 px-4 pt-4 pb-3">User Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsRechargeOpen(true);
                                                    }}
                                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 font-extrabold rounded-2xl transition-all"
                                                >
                                                    <IndianRupee className="w-5 h-5 bg-indigo-500/10 rounded-lg p-1" />
                                                    Add Credit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5 mx-3 my-3" />
                                                <DropdownMenuItem className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-extrabold rounded-2xl transition-all">
                                                    <Briefcase className="w-5 h-5 bg-slate-100 dark:bg-white/5 rounded-lg p-1" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 font-extrabold rounded-2xl transition-all">
                                                    <ShieldCheck className="w-5 h-5 bg-emerald-500/10 rounded-lg p-1" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 font-extrabold rounded-2xl transition-all">
                                                    <ShieldAlert className="w-5 h-5 bg-rose-500/10 rounded-lg p-1" />
                                                    Deactivate Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-96 text-center text-slate-400 font-black uppercase text-xs tracking-[0.4em] border-none">
                                    No members found in the university registry.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <ManualRechargeModal
                open={isRechargeOpen}
                onOpenChange={setIsRechargeOpen}
                user={selectedUser}
            />
        </div>
    );
}
