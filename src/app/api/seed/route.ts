
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: Request) {
    try {
        const db = getAdminDb();

        // 1. Seed Vehicles
        const vehicles = [
            {
                type: 'bus',
                route: 'Bus 73A - Knowledge Park',
                position: { latitude: 28.4731, longitude: 77.4827 },
                crowdLevel: 'Green',
                lastUpdated: FieldValue.serverTimestamp()
            },
            {
                type: 'bus',
                route: 'Bus 100B - Pari Chowk',
                position: { latitude: 28.4750, longitude: 77.5010 },
                crowdLevel: 'Yellow',
                lastUpdated: FieldValue.serverTimestamp()
            },
            {
                type: 'cab',
                route: 'Cab Pool - Alpha 1',
                position: { latitude: 28.4950, longitude: 77.4920 },
                crowdLevel: 'Green',
                lastUpdated: FieldValue.serverTimestamp()
            },
            {
                type: 'bus',
                route: 'Bus 52 - Metro',
                position: { latitude: 28.4850, longitude: 77.4920 },
                crowdLevel: 'Red',
                lastUpdated: FieldValue.serverTimestamp()
            }
        ];

        for (const v of vehicles) {
            await db.collection('vehicles').add(v);
        }

        // 2. Seed Stops
        const stops = [
            { name: "Knowledge Park 3", distance: "200m", buses: "73A, 100B", position: { latitude: 28.4731, longitude: 77.4827 } },
            { name: "Sharda University Gate", distance: "450m", buses: "73A, 52", position: { latitude: 28.4750, longitude: 77.4850 } },
            { name: "Alpha 1 Metro", distance: "1.2km", buses: "Metro", position: { latitude: 28.4950, longitude: 77.4920 } },
        ];

        for (const s of stops) {
            await db.collection('stops').add(s);
        }

        // 3. Grant points to user if uid provided
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const role = searchParams.get('admin') === 'true' ? 'admin' : 'user';

        if (uid) {
            await db.collection('users').doc(uid).set({
                points: 1000,
                profileComplete: true,
                name: 'Test user',
                role: role,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
        }

        return NextResponse.json({
            success: true,
            message: `Seeding complete. User ${uid ? 'updated to ' + role : ''}`
        });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
