export type Vehicle = {
  id: string;
  type: "bus" | "cab";
  route: string;
  position: { latitude: number; longitude: number };
  crowdLevel?: "Green" | "Yellow" | "Red";
};

export interface Ride {
    id: string;
    driverId: string;
    driverName: string;
    driverPhotoUrl: string;
    from: string;
    to: string;
    rideDate: string; 
    seats: number;
    price: number;
    createdAt: any;
    genderPreference: "any" | "female";
    isSmokingAllowed: boolean;
    isMusicAllowed: boolean;
}

export type BusStop = {
    id: string;
    name: string;
    position: { latitude: number; longitude: number };
}
