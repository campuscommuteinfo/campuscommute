import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
}));

// Mock Google Maps
vi.mock('@vis.gl/react-google-maps', () => ({
    APIProvider: ({ children }: any) => children,
    Map: ({ children }: any) => children,
    AdvancedMarker: ({ children }: any) => children,
    Pin: ({ children }: any) => children,
    InfoWindow: ({ children }: any) => children,
}));
