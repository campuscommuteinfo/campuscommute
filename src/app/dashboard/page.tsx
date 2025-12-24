"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bus, Clock, Users, TrendingUp, ChevronRight, Navigation, Sparkles } from "lucide-react";
import LiveTracking from "@/components/live-tracking";
import { type Vehicle } from "@/lib/types";
import VehicleCard from "@/components/vehicle-card";
import XAIDashboard from "@/components/xai-dashboard";
import Link from "next/link";

// Stat card component
const StatCard = ({ icon: Icon, label, value, trend, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <TrendingUp className="w-3 h-3" />
        <span>{trend}</span>
      </div>
    )}
  </div>
);

// Recent ride card
const RecentRideCard = ({ route, time, status }: { route: string; time: string; status: "completed" | "active" }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
      }`}>
      <Bus className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-sm text-gray-800 dark:text-white">{route}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
    {status === "active" && (
      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">Live</span>
    )}
  </div>
);

export default function DashboardPage() {
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [showXAI, setShowXAI] = React.useState(false);

  const handleAddPoints = (amount: number, title: string, description: string) => {
    // TODO: Implement actual points addition via server action
    // This is currently a placeholder - points are managed in CommuteDashboard
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Live Tracking</h2>
        <Link href="/dashboard/ride-sharing" className="text-indigo-600 text-sm font-medium flex items-center gap-1">
          Find Ride <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Map Container - Full width on mobile */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
        <LiveTracking onVehicleSelect={setSelectedVehicle} selectedVehicle={selectedVehicle} />
      </div>

      {/* Selected Vehicle Card */}
      {selectedVehicle && (
        <div className="animate-slide-up">
          <VehicleCard
            key={selectedVehicle.id}
            vehicle={selectedVehicle}
            addPoints={handleAddPoints}
            onClose={() => setSelectedVehicle(null)}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Bus}
          label="Buses Nearby"
          value="4"
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Users}
          label="Active Rides"
          value="12"
          trend="+3 today"
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
      </div>

      {/* XAI Dashboard Toggle & Component */}
      <div className="space-y-3">
        <button
          onClick={() => setShowXAI(!showXAI)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">AI Insights</p>
              <p className="text-white/80 text-xs">See predictions & explanations</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform ${showXAI ? 'rotate-90' : ''}`} />
        </button>

        {showXAI && (
          <div className="animate-slide-up">
            <XAIDashboard routeId="73A" />
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
          <Link href="/dashboard/my-rides" className="text-indigo-600 text-xs font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          <RecentRideCard route="Bus 73A - Knowledge Park" time="Now" status="active" />
          <RecentRideCard route="Cab Pool to Pari Chowk" time="Yesterday, 5:30 PM" status="completed" />
          <RecentRideCard route="Bus 100B - Metro Station" time="Yesterday, 9:15 AM" status="completed" />
        </div>
      </div>

      {/* Nearby Stops */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Nearby Stops</h3>
        <div className="space-y-3">
          {[
            { name: "Knowledge Park 3", distance: "200m", buses: "73A, 100B" },
            { name: "Sharda University Gate", distance: "450m", buses: "73A, 52" },
            { name: "Alpha 1 Metro", distance: "1.2km", buses: "Metro" },
          ].map((stop, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800 dark:text-white">{stop.name}</p>
                <p className="text-xs text-gray-500">{stop.buses}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-800 dark:text-white">{stop.distance}</p>
                <p className="text-xs text-green-600">~{i + 1} min</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

