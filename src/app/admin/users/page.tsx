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
    IndianRupee
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">All Users</h2>
                    <p className="text-slate-500 text-sm font-medium">See and manage everyone who uses the app.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl shadow-sm transition-all active:scale-95">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10 h-10 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-lg focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 flex-1 sm:flex-none">Filter</Button>
                    <Button variant="outline" className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-emerald-600 dark:text-emerald-400 font-bold hover:bg-slate-50 dark:hover:bg-white/5 flex-1 sm:flex-none">Export</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider pl-6 h-12">User Details</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Role</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Travel Points</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Wallet (₹)</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Joined on</TableHead>
                            <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider pr-6 h-12">Menu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="h-48 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Retrieving Data Nodes...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="w-10 h-10 border border-slate-100 dark:border-white/10 rounded-xl">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm rounded-xl">
                                                        {user.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.role === 'admin' && (
                                                    <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-lg p-1 shadow-lg">
                                                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                                    {user.name || "App User"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <Badge variant={user.profileComplete ? "default" : "secondary"} className={cn("w-fit text-[8px] h-4.5 px-2 rounded-lg font-bold uppercase tracking-wider", user.profileComplete ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" : "bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-500/10")}>
                                                {user.profileComplete ? "Verified" : "New User"}
                                            </Badge>
                                            <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5 pl-0.5">
                                                {user.role || 'User'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{user.points || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                ₹
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{user.walletBalance || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all h-9 w-9">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl w-48 shadow-lg">
                                                <DropdownMenuLabel className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-3 pt-2 pb-1">Menu</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsRechargeOpen(true);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-indigo-400 font-bold rounded-xl transition-all"
                                                >
                                                    <IndianRupee className="w-4 h-4" />
                                                    Add Money
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                                                <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-slate-300 font-bold rounded-xl transition-all">
                                                    <Mail className="w-4 h-4" />
                                                    Email User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-emerald-400 font-bold rounded-xl transition-all">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Grant Access
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-rose-500 font-bold rounded-xl transition-all">
                                                    <ShieldAlert className="w-4 h-4" />
                                                    Restrict User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-black uppercase text-xs tracking-widest border-none">
                                    No data nodes found matching query.
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
