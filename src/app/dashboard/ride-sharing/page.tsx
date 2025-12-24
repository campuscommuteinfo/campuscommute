import RideSharing from '@/components/ride-sharing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Rides',
  description: 'Find and share rides with students in Knowledge Park, Greater Noida. Post your ride or join others.',
};

export default function RideSharingPage() {
  return <RideSharing />;
}
