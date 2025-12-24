import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://commute-companion.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard/profile',
                    '/dashboard/my-rides',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: '/api/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
