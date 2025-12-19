
"use client";

import * as React from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Bus, CarFront, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Vehicle, type BusStop } from "@/lib/types";
import { getBusStopsForRoute } from "@/lib/bus-stops";

interface LiveTrackingProps {
    onVehicleSelect: (vehicle: Vehicle) => void;
    selectedVehicle: Vehicle | null;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function LiveTracking({ onVehicleSelect, selectedVehicle }: LiveTrackingProps) {
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [busStops, setBusStops] = React.useState<BusStop[]>([]);
    const [center, setCenter] = React.useState({ lat: 28.4983, lng: 77.4978 }); // Knowledge Park, Greater Noida

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
        } else {
            setBusStops([]);
        }
    }, [selectedVehicle]);

    const getPinProps = (vehicle: Vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        const baseProps = {
            scale: isSelected ? 1.5 : 1,
            borderColor: '#FF9933', // Primary color
        };
        switch (vehicle.crowdLevel) {
            case 'Green': return { ...baseProps, background: '#22c55e', glyphColor: '#ffffff', borderColor: isSelected ? '#FF9933' : '#22c55e' };
            case 'Yellow': return { ...baseProps, background: '#f59e0b', glyphColor: '#ffffff', borderColor: isSelected ? '#FF9933' : '#f59e0b' };
            case 'Red': return { ...baseProps, background: '#ef4444', glyphColor: '#ffffff', borderColor: isSelected ? '#FF9933' : '#ef4444' };
            default: return { ...baseProps, background: '#FF9933', glyphColor: '#ffffff', borderColor: isSelected ? '#FF9933' : '#ffffff'};
        }
    };
    
    if (!API_KEY) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Live Vehicle Map</CardTitle>
                </CardHeader>
                <CardContent className="h-[60vh] flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center text-destructive">
                        <p className="font-bold">Map configuration missing.</p>
                        <p className="text-sm">Please add your Google Maps API Key to the .env file.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Vehicle Map</CardTitle>
                <CardDescription>Real-time locations of buses and cabs with crowdsourced data.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full h-[60vh] rounded-lg overflow-hidden">
                   <APIProvider apiKey={API_KEY}>
                        <Map
                            center={center}
                            zoom={14}
                            mapId="commute_companion_map"
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                        >
                            {vehicles.map(vehicle => (
                                <AdvancedMarker
                                    key={vehicle.id}
                                    position={{ lat: vehicle.position.latitude, lng: vehicle.position.longitude }}
                                    onClick={() => onVehicleSelect(vehicle)}
                                >
                                     <Pin {...getPinProps(vehicle)}>
                                         {vehicle.type === 'bus' ? <Bus className="size-5" /> : <CarFront className="size-5" />}
                                     </Pin>
                                </AdvancedMarker>
                            ))}

                            {busStops.map(stop => (
                                <AdvancedMarker
                                    key={stop.id}
                                    position={{ lat: stop.position.latitude, lng: stop.position.longitude }}
                                >
                                   <span className="text-xs text-primary/80"><CircleDot className="size-3" /></span>
                                </AdvancedMarker>
                            ))}
                            
                             {selectedVehicle && (
                                <InfoWindow
                                    position={{ lat: selectedVehicle.position.latitude, lng: selectedVehicle.position.longitude }}
                                    onCloseClick={() => onVehicleSelect(null as any)}
                                    pixelOffset={[0,-40]}
                                >
                                   <div className="p-2">
                                     <h3 className="font-bold">{selectedVehicle.route}</h3>
                                     <p className="text-sm">Crowd: {selectedVehicle.crowdLevel || 'N/A'}</p>
                                   </div>
                                </InfoWindow>
                            )}

                        </Map>
                         {vehicles.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
                                <p className="text-white bg-black/50 p-4 rounded-lg">Searching for active vehicles on the map...</p>
                            </div>
                        )}
                   </APIProvider>
                </div>
            </CardContent>
        </Card>
    );
}
