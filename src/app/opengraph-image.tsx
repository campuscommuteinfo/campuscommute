import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Commute Companion - AI-Powered Campus Ride Sharing'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0A0A0F 0%, #1a1a2e 50%, #16213e 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                    }}
                />

                {/* Logo Icon */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: 28,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
                        marginBottom: 40,
                        boxShadow: '0 20px 60px rgba(79, 70, 229, 0.4)',
                    }}
                >
                    <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M8 6v6" />
                        <path d="M15 6v6" />
                        <path d="M2 12h19.6" />
                        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                        <circle cx="7" cy="18" r="2" />
                        <path d="M9 18h5" />
                        <circle cx="16" cy="18" r="2" />
                    </svg>
                </div>

                {/* Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            margin: 0,
                            letterSpacing: '-2px',
                        }}
                    >
                        Commute Companion
                    </h1>
                    <p
                        style={{
                            fontSize: 28,
                            color: '#94a3b8',
                            margin: '20px 0 0 0',
                            textAlign: 'center',
                            maxWidth: 800,
                        }}
                    >
                        AI-Powered Campus Ride Sharing & Live Bus Tracking
                    </p>
                </div>

                {/* Features */}
                <div
                    style={{
                        display: 'flex',
                        gap: 40,
                        marginTop: 50,
                    }}
                >
                    {['🚌 Live Tracking', '🚗 Ride Sharing', '🏆 Rewards', '🛡️ Safety'].map((feature) => (
                        <div
                            key={feature}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 50,
                                fontSize: 20,
                                color: '#e2e8f0',
                            }}
                        >
                            {feature}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <p
                    style={{
                        position: 'absolute',
                        bottom: 30,
                        fontSize: 18,
                        color: '#64748b',
                    }}
                >
                    Knowledge Park, Greater Noida
                </p>
            </div>
        ),
        {
            ...size,
        }
    )
}
