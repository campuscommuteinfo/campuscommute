# 🚌 Commute Companion

**Your Smart Campus Ride-Pooling Solution**

Commute Companion is a modern, AI-powered transportation platform designed specifically for students in Knowledge Park, Greater Noida. It connects daily commuters to share rides, split fares, and travel affordably with verified co-travellers.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-11.9-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Genkit AI](https://img.shields.io/badge/Genkit_AI-1.14-purple?style=flat-square)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Firebase Setup](#-firebase-setup)
- [AI Features](#-ai-features)
- [Security](#-security)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🗺️ Live Vehicle Tracking
- **Real-time GPS tracking** of buses and cabs on an interactive Google Maps interface
- **Crowd-level indicators** (Green/Yellow/Red) showing vehicle capacity status
- **Bus stop markers** displayed along routes for easy navigation
- **Offline persistence** with Firestore IndexedDB for seamless experience

### 🚗 Ride Sharing System
- **Post rides** as a driver with customizable options (seats, price, date, preferences)
- **Find rides** going your way with real-time matching
- **Request to join** available rides with driver approval system
- **Gender-preference matching** for added comfort and safety
- **Ride preferences** including smoking and music allowance settings

### 🤖 AI-Powered Intelligence (Google Gemini)
- **Bus crowd prediction** based on time, day, and academic calendar events
- **Delay explanation** with contextual reasoning for late buses
- **Smart suggestions** to avoid crowded buses during peak hours

### 🎮 Gamified Rewards System
- **Earn points** for every ride, crowd report, and interaction
- **Redeem rewards** including:
  - ₹50 Ride Vouchers
  - DMart/BigBasket Gift Cards
  - Sharda Canteen Coupons
- **Track redeemed vouchers** with QR code display
- **Transaction-safe** point redemption with Firestore transactions

### 🛡️ Safety Features
- **Emergency SOS button** for instant alerts
- **Emergency contacts management** with quick-dial functionality
- **Trip sharing** to let friends/family track your journey
- **Verified user system** for trusted community building
- **Female-only matching** option for added safety

### 👤 User Profile Management
- **Complete profile setup** with personal information
- **Ride preferences** configuration (smoking, music, gender preference)
- **Account deletion** with full data removal
- **Password management** for email-authenticated users

### 🔔 Real-time Notifications
- **Ride request notifications** for drivers
- **Accept/Decline actions** directly from the notification popover
- **Toast notifications** for important actions and updates

### 📱 Progressive Web App (PWA)
- **Installable** on mobile devices and desktops
- **Offline support** with service worker
- **Push notification ready** infrastructure

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15.5** | React framework with App Router & Turbopack |
| **TypeScript 5** | Type-safe development |
| **TailwindCSS 3.4** | Utility-first CSS styling |
| **Radix UI** | Accessible, unstyled component primitives |
| **Lucide React** | Beautiful, consistent icons |
| **React Hook Form** | Performant form handling |
| **Zod** | TypeScript-first schema validation |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Email/password authentication |
| **Cloud Firestore** | Real-time NoSQL database |
| **Firebase Analytics** | User behavior tracking |
| **Google Maps API** | Interactive maps and static map images |
| **Google Genkit AI** | AI flows for predictions and explanations |
| **Gemini Pro** | Large language model for AI features |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Turbopack** | Fast development builds |
| **ESLint** | Code linting |
| **next-pwa** | PWA generation |
| **date-fns** | Date manipulation |

---

## 📁 Project Structure

```
campus-commute/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Authentication page
│   │   ├── dashboard/          # Protected dashboard routes
│   │   │   ├── page.tsx        # Main dashboard (live tracking)
│   │   │   ├── ride-sharing/   # Ride sharing page
│   │   │   ├── rewards/        # Rewards & points page
│   │   │   ├── my-rides/       # User's redeemed rides
│   │   │   ├── safety/         # Safety features page
│   │   │   └── profile/        # User profile page
│   │   ├── globals.css         # Global styles & CSS variables
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/ui components (35+ components)
│   │   ├── commute-dashboard.tsx    # Main dashboard layout with sidebar
│   │   ├── live-tracking.tsx        # Google Maps with vehicle markers
│   │   ├── vehicle-card.tsx         # Vehicle details with AI features
│   │   ├── ride-sharing.tsx         # Ride listing and requests
│   │   ├── post-ride-dialog.tsx     # Post new ride form
│   │   ├── rewards.tsx              # Points & rewards system
│   │   ├── safety-shield.tsx        # Emergency contacts & SOS
│   │   ├── profile.tsx              # User profile management
│   │   ├── notification-bell.tsx    # Ride request notifications
│   │   ├── my-free-rides.tsx        # Redeemed vouchers list
│   │   └── logo.tsx                 # App logo component
│   │
│   ├── ai/                     # Genkit AI integration
│   │   ├── genkit.ts           # Genkit configuration
│   │   ├── dev.ts              # Development server
│   │   └── flows/
│   │       ├── predict-bus-crowd-levels.ts  # Crowd prediction AI
│   │       └── explain-bus-delays.ts        # Delay explanation AI
│   │
│   ├── lib/                    # Utilities & configuration
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── bus-stops.ts        # Bus stop mock data
│   │   └── utils.ts            # Utility functions (cn helper)
│   │
│   └── hooks/                  # Custom React hooks
│       ├── use-toast.ts        # Toast notification hook
│       └── use-mobile.tsx      # Mobile detection hook
│
├── public/                     # Static assets
├── firestore.rules             # Firestore security rules
├── firebase.json               # Firebase configuration
├── next.config.ts              # Next.js & PWA configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── package.json                # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase project** with Firestore enabled
- **Google Maps API key** with Maps JavaScript API enabled
- **Gemini API key** for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campus-commute.git
   cd campus-commute
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#-environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack on port 9002 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run genkit:dev` | Start Genkit AI development server |
| `npm run genkit:watch` | Start Genkit with hot reload |

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Mapbox (Optional - for additional map features)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your_mapbox_token"

# Google AI (Gemini)
GEMINI_API_KEY="your_gemini_api_key"

# Google Maps
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🔥 Firebase Setup

### Firestore Collections

| Collection | Description |
|------------|-------------|
| `users/{userId}` | User profiles and settings |
| `users/{userId}/emergency_contacts` | Emergency contact list |
| `users/{userId}/redeemed_vouchers` | Redeemed reward vouchers |
| `users/{userId}/subscriptions` | Push notification subscriptions |
| `vehicles/{vehicleId}` | Real-time vehicle data |
| `rides/{rideId}` | Available ride shares |
| `ride_requests/{requestId}` | Ride join requests |

### Security Rules

The app includes comprehensive Firestore security rules:

- **Users** can only read/write their own data
- **Admin status** cannot be self-modified
- **Vehicles** are read-only for clients
- **Rides** can be created by any authenticated user
- **Ride updates/deletes** only allowed by the driver who created them
- **Ride requests** follow proper authorization flow

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 🤖 AI Features

### Bus Crowd Level Prediction

Predicts how crowded a bus will be based on:
- Route ID
- Time of day
- Day of the week
- Academic calendar events (exams, holidays)

Returns a crowd level (Green/Yellow/Red) with an explanation.

### Bus Delay Explanation

Provides intelligent explanations for bus delays considering:
- Traffic conditions
- Time of day patterns
- Weather factors
- Special events

### Running AI Development Server

```bash
npm run genkit:dev
# or with hot reload
npm run genkit:watch
```

---

## 🔒 Security

### Authentication
- Email/password authentication via Firebase Auth
- Secure session management
- Password strength requirements

### Data Protection
- Firestore security rules enforce user data isolation
- Emergency contacts are private to each user
- Points transactions use atomic operations

### Client-side Security
- Environment variables properly scoped (`NEXT_PUBLIC_` prefix)
- API keys secured through Firebase restrictions

---

## 📸 Screenshots

> *Add screenshots of your application here*

### Landing Page
*Beautiful marketing page with feature highlights*

### Live Tracking Dashboard
*Interactive Google Maps with vehicle markers and crowd indicators*

### Ride Sharing
*Browse and request to join available rides*

### Rewards System
*Earn points and redeem valuable vouchers*

### Safety Features
*Emergency SOS and contact management*

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Google Sign-In integration
- [ ] Real-time chat between riders
- [ ] Payment integration for ride fares
- [ ] Push notifications for ride updates
- [ ] Admin dashboard for vehicle management
- [ ] Route optimization suggestions
- [ ] Carbon footprint tracking
- [ ] Multi-language support

### Known Limitations
- Vehicle data is currently mocked
- QR codes for vouchers are placeholder
- Bus stops are pre-defined (not dynamic)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as a Final Year project at Sharda University, Knowledge Park, Greater Noida.

---

## 📞 Contact

- **Location:** Sharda University, Knowledge Park, Greater Noida
- **Email:** support@commutecompanion.app
- **Phone:** +91 12345 67890

---

<p align="center">
  Made with ❤️ for the campus community
  <br>
  <strong>© 2025 Commute Companion. All rights reserved.</strong>
</p>
