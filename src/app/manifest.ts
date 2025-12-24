import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Commute Companion',
        short_name: 'Commute',
        description: 'AI-Powered Campus Ride Sharing & Live Bus Tracking for Greater Noida',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#0A0A0F',
        theme_color: '#4F46E5',
        orientation: 'portrait',
        scope: '/',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
        categories: ['transportation', 'social', 'lifestyle'],
        screenshots: [
            {
                src: '/screenshots/dashboard.png',
                sizes: '1080x1920',
                type: 'image/png',
                // @ts-ignore - form_factor is valid but not in types
                form_factor: 'narrow',
            },
        ],
    }
}
