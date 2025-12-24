import { Timestamp } from "firebase/firestore";

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
  createdAt: Timestamp | Date | string;
  genderPreference: "any" | "female";
  isSmokingAllowed: boolean;
  isMusicAllowed: boolean;
  // AI fare tracking (optional)
  aiFareSuggested?: number | null;
  fareAccepted?: boolean | null;
}

export type BusStop = {
  id: string;
  name: string;
  position: { latitude: number; longitude: number };
}

