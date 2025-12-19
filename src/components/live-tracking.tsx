"use client";

import * as React from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Bus, CarFront, CircleDot, Locate, Minus, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Vehicle, type BusStop } from "@/lib/types";
import { getBusStopsForRoute } from "@/lib/bus-stops";
import { Button } from "@/components/ui/button";

interface LiveTrackingProps {
    onVehicleSelect: (vehicle: Vehicle) => void;
    selectedVehicle: Vehicle | null;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Legend component
const MapLegend = () => (
    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-10">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Crowd Level</p>
        <div className="space-y-1.5">
            {[
                { color: "bg-green-500", label: "Low" },
                { color: "bg-yellow-500", label: "Medium" },
                { color: "bg-red-500", label: "High" },
            ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                </div>
            ))}
        </div>
    </div>
);

// Vehicle chip for bottom list
const VehicleChip = ({
    vehicle,
    isSelected,
    onClick
}: {
    vehicle: Vehicle;
    isSelected: boolean;
    onClick: () => void;
}) => {
    const crowdColors = {
        Green: "bg-green-500",
        Yellow: "bg-yellow-500",
        Red: "bg-red-500",
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap touch-target",
                isSelected
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm active:scale-95"
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isSelected ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
            )}>
                {vehicle.type === "bus" ? (
                    <Bus className={cn("w-4 h-4", isSelected ? "text-white" : "text-gray-600 dark:text-gray-400")} />
                ) : (
                    <CarFront className={cn("w-4 h-4", isSelected ? "text-white" : "text-gray-600 dark:text-gray-400")} />
                )}
            </div>
            <div className="text-left">
                <p className={cn("text-sm font-medium", !isSelected && "text-gray-800 dark:text-white")}>
                    {vehicle.route}
                </p>
                <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", crowdColors[vehicle.crowdLevel as keyof typeof crowdColors] || "bg-gray-400")} />
                    <span className={cn("text-xs", isSelected ? "text-white/80" : "text-gray-500")}>
                        {vehicle.crowdLevel || "Unknown"}
                    </span>
                </div>
            </div>
        </button>
    );
};

export default function LiveTracking({ onVehicleSelect, selectedVehicle }: LiveTrackingProps) {
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [busStops, setBusStops] = React.useState<BusStop[]>([]);
    const [center, setCenter] = React.useState({ lat: 28.4983, lng: 77.4978 });
    const [zoom, setZoom] = React.useState(14);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
            const fetchedVehicles: Vehicle[] = [];
            snapshot.forEach((doc) => {
                fetchedVehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
            });
            setVehicles(fetchedVehicles);
        });

        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        if (selectedVehicle && selectedVehicle.type === 'bus') {
            const stops = getBusStopsForRoute(selectedVehicle.route);
            setBusStops(stops);
            // Center on selected vehicle
            setCenter({
                lat: selectedVehicle.position.latitude,
                lng: selectedVehicle.position.longitude
            });
        } else {
            setBusStops([]);
        }
    }, [selectedVehicle]);

    const getPinProps = (vehicle: Vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        const baseProps = {
            scale: isSelected ? 1.4 : 1,
            borderColor: '#4F46E5',
        };
        switch (vehicle.crowdLevel) {
            case 'Green': return { ...baseProps, background: '#22c55e', glyphColor: '#ffffff', borderColor: isSelected ? '#4F46E5' : '#22c55e' };
            case 'Yellow': return { ...baseProps, background: '#f59e0b', glyphColor: '#ffffff', borderColor: isSelected ? '#4F46E5' : '#f59e0b' };
            case 'Red': return { ...baseProps, background: '#ef4444', glyphColor: '#ffffff', borderColor: isSelected ? '#4F46E5' : '#ef4444' };
            default: return { ...baseProps, background: '#4F46E5', glyphColor: '#ffffff', borderColor: isSelected ? '#4F46E5' : '#ffffff' };
        }
    };

    if (!API_KEY) {
        return (
            <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Map Not Available</p>
                    <p className="text-sm text-gray-500 mt-1">Please configure Google Maps API key</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Map Container - Aspect ratio for mobile */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden">
                <APIProvider apiKey={API_KEY}>
                    <Map
                        center={center}
                        zoom={zoom}
                        onZoomChanged={(e) => setZoom(e.detail.zoom)}
                        mapId="commute_companion_map"
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        className="w-full h-full"
                    >
                        {vehicles.map(vehicle => (
                            <AdvancedMarker
                                key={vehicle.id}
                                position={{ lat: vehicle.position.latitude, lng: vehicle.position.longitude }}
                                onClick={() => onVehicleSelect(vehicle)}
                            >
                                <Pin {...getPinProps(vehicle)}>
                                    {vehicle.type === 'bus' ? <Bus className="size-4" /> : <CarFront className="size-4" />}
                                </Pin>
                            </AdvancedMarker>
                        ))}

                        {busStops.map(stop => (
                            <AdvancedMarker
                                key={stop.id}
                                position={{ lat: stop.position.latitude, lng: stop.position.longitude }}
                            >
                                <span className="text-xs text-indigo-500"><CircleDot className="size-3" /></span>
                            </AdvancedMarker>
                        ))}

                        {selectedVehicle && (
                            <InfoWindow
                                position={{ lat: selectedVehicle.position.latitude, lng: selectedVehicle.position.longitude }}
                                onCloseClick={() => onVehicleSelect(null as any)}
                                pixelOffset={[0, -40]}
                            >
                                <div className="p-1">
                                    <h3 className="font-bold text-sm">{selectedVehicle.route}</h3>
                                    <p className="text-xs text-gray-600">Crowd: {selectedVehicle.crowdLevel || 'N/A'}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>

                {/* Loading state */}
                {vehicles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg text-center">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Finding vehicles...</p>
                        </div>
                    </div>
                )}

                {/* Map Legend */}
                <MapLegend />

                {/* Zoom controls - Mobile friendly */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10 rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-lg"
                        onClick={() => setZoom(z => Math.min(z + 1, 20))}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10 rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-lg"
                        onClick={() => setZoom(z => Math.max(z - 1, 10))}
                    >
                        <Minus className="w-5 h-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10 rounded-xl bg-white/95 dark:bg-gray-800/95 shadow-lg"
                        onClick={() => setCenter({ lat: 28.4983, lng: 77.4978 })}
                    >
                        <Locate className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Horizontal scrollable vehicle list */}
            {vehicles.length > 0 && (
                <div className="mt-4 -mx-4 px-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="snap-start">
                                <VehicleChip
                                    vehicle={vehicle}
                                    isSelected={selectedVehicle?.id === vehicle.id}
                                    onClick={() => onVehicleSelect(vehicle)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
