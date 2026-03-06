"use client";

import {
    Settings,
    Bell,
    Database,
    Zap,
    Lock,
    Save,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function SystemSettings() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h2>
                    <p className="text-slate-500 text-sm font-medium">Change how the app works and your settings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-5 rounded-xl shadow-sm transition-all active:scale-95">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation / Sidebar for Settings */}
                <div className="space-y-2">
                    {[
                        { label: 'General Config', icon: Settings, active: true },
                        { label: 'Security & Auth', icon: Lock },
                        { label: 'Notifications', icon: Bell },
                        { label: 'Data Registry', icon: Database },
                        { label: 'Performance', icon: Zap },
                    ].map((item, i) => (
                        <button key={i} className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold uppercase tracking-wider text-[9px]", item.active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white")}>
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Settings Panel */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-6">
                            <CardTitle className="text-slate-900 dark:text-white text-lg">App Branding</CardTitle>
                            <CardDescription className="text-slate-500 text-xs font-medium">Manage how the app looks to users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider ml-0.5">App Name</Label>
                                    <Input defaultValue="Campus Commute" className="h-10 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider ml-0.5">Support Email</Label>
                                    <Input defaultValue="support@campuscommute.edu" className="h-10 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider ml-0.5">App Status Message</Label>
                                <Input defaultValue="All campus transit routes are operational." className="h-10 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-6">
                            <CardTitle className="text-slate-900 dark:text-white text-lg">Global Restrictions</CardTitle>
                            <CardDescription className="text-slate-500 text-xs font-medium">Configure system-wide safety and operational limits.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { title: 'Driver Verification Required', desc: 'All carpool drivers must be verified by admin before posting.', active: true },
                                { title: 'Night-Time Safety Mode', desc: 'Alert safety teams for rides after 10:00 PM.', active: true },
                                { title: 'External Domain Access', desc: 'Allow users from non-campus email domains.', active: false },
                            ].map((toggle, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{toggle.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{toggle.desc}</p>
                                    </div>
                                    <Switch checked={toggle.active} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border border-rose-100 dark:border-rose-500/10 bg-rose-50 dark:bg-rose-500/5 rounded-2xl overflow-hidden">
                        <CardHeader className="p-6">
                            <CardTitle className="text-rose-600 dark:text-rose-500 text-base">Danger Zone</CardTitle>
                            <CardDescription className="text-rose-500/70 text-[10px] font-bold uppercase tracking-wider">Actions that delete important data.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 font-bold px-4 h-9 rounded-lg text-[10px] uppercase tracking-wider">
                                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                Reset Cache
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
