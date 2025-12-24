import { Metadata } from 'next';
import RideDetailClient from './client';

export const metadata: Metadata = {
    title: 'Ride Details | Commute Companion',
    description: 'View ride details and chat with ride participants',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RideDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <RideDetailClient rideId={id} />;
}
