import { BusStop } from './types';

// Mock data for bus stops. In a real application, this would come from a database.
const busStopsData: { [route: string]: BusStop[] } = {
  "73A": [
    { id: 'stop-1', name: 'Sharda University Gate 1', position: { latitude: 28.4731, longitude: 77.4831 } },
    { id: 'stop-2', name: 'GNIOT Campus', position: { latitude: 28.4777, longitude: 77.4893 } },
    { id: 'stop-3', name: 'Knowledge Park II Metro', position: { latitude: 28.4845, longitude: 77.4985 } },
    { id: 'stop-4', name: 'Pari Chowk', position: { latitude: 28.4682, longitude: 77.5015 } },
    { id: 'stop-5', name: 'Alpha I Commercial Belt', position: { latitude: 28.4590, longitude: 77.5082 } },
  ],
  "100B": [
    { id: 'stop-6', name: 'Galgotias University', position: { latitude: 28.3665, longitude: 77.5395 } },
    { id: 'stop-7', name: 'Yamuna Expressway', position: { latitude: 28.3965, longitude: 77.5621 } },
    { id: 'stop-3', name: 'Knowledge Park II Metro', position: { latitude: 28.4845, longitude: 77.4985 } },
    { id: 'stop-8', name: 'Jagdishpur', position: { latitude: 28.5123, longitude: 77.5198 } },
  ],
   "45": [
    { id: 'stop-4', name: 'Pari Chowk', position: { latitude: 28.4682, longitude: 77.5015 } },
    { id: 'stop-9', name: 'Ansal Plaza', position: { latitude: 28.4601, longitude: 77.4907 } },
    { id: 'stop-10', name: 'Sector 37', position: { latitude: 28.5528, longitude: 77.3193 } },
    { id: 'stop-11', name: 'Botanical Garden Metro', position: { latitude: 28.5630, longitude: 77.3450 } },
  ]
};

export function getBusStopsForRoute(route: string): BusStop[] {
  return busStopsData[route] || [];
}
