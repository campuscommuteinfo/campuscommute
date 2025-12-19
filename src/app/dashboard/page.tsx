"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Map } from "lucide-react";
import LiveTracking from "@/components/live-tracking";
import { type Vehicle } from "@/lib/types";
import VehicleCard from "@/components/vehicle-card";

interface DashboardPageProps {
  addPoints?: (amount: number, title: string, description: string) => void;
}

export default function DashboardPage({ addPoints }: DashboardPageProps) {
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);

  // A default function if addPoints is not provided.
  const handleAddPoints = addPoints || (() => console.log("addPoints function not provided"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <LiveTracking onVehicleSelect={setSelectedVehicle} selectedVehicle={selectedVehicle} />
      </div>
      <div className="lg:col-span-1">
        {selectedVehicle ? (
          <VehicleCard
            key={selectedVehicle.id}
            vehicle={selectedVehicle}
            addPoints={handleAddPoints}
            onClose={() => setSelectedVehicle(null)}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <Map className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Select a vehicle on the map to see details and earn points.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
