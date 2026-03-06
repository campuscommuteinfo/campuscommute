"use client";

import * as React from "react";
import {
    Search,
    Clock,
    User,
    CheckCircle2,
    Eye,
    MessageSquare,
    Flag
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
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SafetyReport {
    id: string;
    vehicleName?: string;
    issueType?: string;
    userName?: string;
    priority?: string;
    status?: string;
    timestamp?: any;
}

export default function SafetyReports() {
    const [reports, setReports] = React.useState<SafetyReport[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, "vehicle_reports"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            const reportData = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredReports = reports.filter(r =>
        r.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityStyle = (priority: string | undefined) => {
        switch (priority?.toLowerCase()) {
            case 'high': return "bg-rose-500/10 text-rose-400";
            case 'medium': return "bg-amber-500/10 text-amber-400";
            default: return "bg-indigo-500/10 text-indigo-400";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Safety Reports</h2>
                    <p className="text-slate-500 text-sm font-medium">Urgent alerts, reports, and feedback from users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="h-9 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 font-bold uppercase tracking-wider text-[9px]">
                        {reports.filter(r => r.status !== 'resolved').length} Alerts Pending
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search incidents or vehicles..."
                        className="pl-10 h-10 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-lg focus:ring-1 focus:ring-rose-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5">Filter Priority</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider pl-6 h-12">Incident Subject</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Reporter</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Priority</TableHead>
                            <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider h-12">Timeline</TableHead>
                            <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider pr-6 h-12">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="border-none">
                                <TableCell colSpan={5} className="h-40 text-center border-none">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-500 font-bold tracking-wider text-[9px] uppercase">Looking for alerts...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <TableRow key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5 transition-colors group">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/10 flex items-center justify-center">
                                                <Flag className="w-4 h-4 text-rose-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{report.issueType || 'Incident'}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                                    For: {report.vehicleName || 'App'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{report.userName || 'Anonymous'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("text-[8px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5", getPriorityStyle(report.priority).replace('text-', 'dark:text-'))}>
                                            {report.priority || 'Medium'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                            <Clock className="w-3 h-3" />
                                            {report.timestamp ? formatDistanceToNow(report.timestamp instanceof Date ? report.timestamp : report.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1 px-1">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500 font-black uppercase text-xs tracking-widest border-none">
                                    All good. No reports found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
