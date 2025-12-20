# 🚌 Commute Companion

**Your Smart Campus Ride-Pooling Solution**

Commute Companion is a modern, AI-powered transportation platform designed specifically for students in Knowledge Park, Greater Noida. It connects daily commuters to share rides, split fares, and travel affordably with verified co-travellers.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.9-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Genkit AI](https://img.shields.io/badge/Genkit_AI-1.14-purple?style=flat-square)

---

## 📊 Production Readiness Assessment

### Overall Score: **8.5/10** - Ready for Beta Launch ✅

| Category | Score | Status |
|----------|-------|--------|
| **Core Features** | 9/10 | ✅ Complete |
| **Mobile Optimization** | 9/10 | ✅ Complete |
| **Authentication** | 9/10 | ✅ Google OAuth Working |
| **Race Condition Handling** | 9/10 | ✅ All Fixed |
| **Error Handling** | 8/10 | ✅ Comprehensive |
| **Database Security** | 7/10 | ⚠️ Rules Ready, Deploy Needed |
| **AI Features** | 7/10 | ⚠️ Requires Gemini API Key |
| **Real Data** | 5/10 | ⚠️ Currently Mocked |
| **Payment Integration** | 0/10 | ❌ Not Implemented |

---

## 📁 Project Structure

```
campus-commute/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Main dashboard & sub-pages
│   │   │   ├── page.tsx        # Home with live tracking
│   │   │   ├── ride-sharing/   # Find & post rides
│   │   │   ├── rewards/        # Points & redemption
│   │   │   ├── safety/         # Emergency contacts & SOS
│   │   │   ├── profile/        # User profile management
│   │   │   └── my-rides/       # Redeemed vouchers
│   │   ├── login/              # Google authentication
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── globals.css         # Global styles & CSS variables
│   ├── components/             # React components
│   │   ├── ui/                 # 34 Radix UI primitives (shadcn/ui)
│   │   ├── commute-dashboard.tsx     # Main dashboard wrapper
│   │   ├── live-tracking.tsx         # Google Maps integration
│   │   ├── ride-sharing.tsx          # Ride matching system
│   │   ├── rewards.tsx               # Points & redemption
│   │   ├── safety-shield.tsx         # SOS & emergency contacts
│   │   ├── profile.tsx               # User settings
│   │   ├── vehicle-card.tsx          # AI-powered vehicle info
│   │   ├── notification-bell.tsx     # Ride request notifications
│   │   ├── post-ride-dialog.tsx      # Create new ride
│   │   ├── my-free-rides.tsx         # Voucher management
│   │   ├── crowd-report-dialog.tsx   # Report crowd levels
│   │   ├── add-emergency-contact-dialog.tsx
│   │   └── logo.tsx                  # Brand logo component
│   ├── ai/                     # Google Genkit AI flows
│   │   ├── genkit.ts           # Genkit configuration (Gemini 2.0)
│   │   └── flows/
│   │       ├── predict-bus-crowd-levels.ts
│   │       └── explain-bus-delays.ts
│   ├── lib/                    # Utilities & configuration
│   │   ├── firebase.ts         # Firebase client setup
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── bus-stops.ts        # Route stop data
│   │   └── utils.ts            # Helper functions
│   └── hooks/                  # Custom React hooks
│       ├── use-toast.ts        # Toast notifications
│       └── use-mobile.tsx      # Responsive detection
├── docs/
│   └── blueprint.md            # Original project specification
├── public/                     # Static assets
├── firestore.rules             # Database security rules
├── firebase.json               # Firebase configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── package.json                # Dependencies & scripts
```

---

## ✨ Core Features

### 🗺️ Live Vehicle Tracking
Real-time GPS tracking system with interactive Google Maps integration.

| Feature | Implementation |
|---------|----------------|
| **Interactive Map** | Google Maps via `@vis.gl/react-google-maps` |
| **Vehicle Markers** | Color-coded pins (Bus/Cab) with crowd indicators |
| **Bus Stop Display** | Route-specific stops with position markers |
| **Map Controls** | Zoom, center, layer toggle, locate me |
| **Real-time Updates** | Firestore `onSnapshot` listeners |
| **Offline Support** | IndexedDB persistence enabled |
| **Vehicle Selection** | Tap marker → AI-powered info card |

### 🚗 Ride Sharing System
Complete peer-to-peer ride-sharing with driver/passenger matching.

| Feature | Implementation |
|---------|----------------|
| **Post Rides** | Create rides with date, seats, price, preferences |
| **Find Rides** | Real-time list with filters (upcoming only) |
| **Join Requests** | Request system with driver approval |
| **Notifications** | Real-time bell with accept/decline |
| **Preferences** | Gender matching, smoking, music allowed |
| **Validation** | Zod schemas for all form inputs |
| **Double-Submit Protection** | `isJoining` / `isProcessing` states |

### 🤖 AI-Powered Intelligence (Google Gemini 2.0)
Two AI flows built with Google Genkit for intelligent predictions.

#### Crowd Level Prediction
```typescript
Input: { routeId, time, dayOfWeek, academicCalendarEvents? }
Output: { crowdLevel: "Green" | "Yellow" | "Red", explanation: string }
```
- Considers class schedules (9 AM - 5 PM)
- Peak hour awareness (8-10 AM, 4-6 PM)
- Weekend/event adjustments

#### Bus Delay Explanation
```typescript
Input: { route, stop }
Output: { explanation: string }
```
- Context-aware reasoning
- Traffic, weather, event factors
- Student-friendly explanations

### 🎮 Gamified Rewards System
Points-based engagement with transaction-safe redemption.

| Reward | Points | Category |
|--------|--------|----------|
| ₹50 Ride Voucher | 200 | Transport |
| Amazon Gift Card | 500 | Shopping |
| Blinkit Voucher | 400 | Groceries |
| Canteen Coupon | 300 | Campus |

**Technical Implementation:**
- Firestore transactions for atomic point updates
- Optimistic UI updates with rollback on failure
- Real-time point synchronization
- QR code display for vouchers (placeholder)

### 🛡️ Safety Features
Comprehensive safety toolkit for secure commuting.

| Feature | Description |
|---------|-------------|
| **Emergency SOS** | Countdown timer with vibration feedback |
| **Emergency Contacts** | Add/delete contacts with quick dial |
| **Trip Sharing** | Share journey via Web Share API |
| **Female-Only Option** | Gender preference filtering |
| **Delete Protection** | Prevents accidental double-deletes |

### 👤 User Profile Management
Complete profile system with preference management.

| Feature | Implementation |
|---------|----------------|
| **Google Sign-In** | Popup with redirect fallback |
| **Display Name** | Editable with save |
| **Newsletter Toggle** | Optimistic UI updates |
| **Account Deletion** | Full data removal with confirmation |
| **Avatar Display** | Google profile photo or initials |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1 | React framework with App Router & Turbopack |
| **React** | 19 | UI library with latest features |
| **TypeScript** | 5 | Type-safe development |
| **TailwindCSS** | 3.4 | Utility-first styling |
| **Radix UI** | Latest | 34 accessible component primitives |
| **Lucide React** | 0.475 | Beautiful icon set |
| **React Hook Form** | 7.54 | Performant form handling |
| **Zod** | 3.24 | Schema validation |
| **date-fns** | 3.6 | Date formatting |
| **Embla Carousel** | 8.6 | Touch-friendly carousels |

### Backend & Services
| Technology | Version | Purpose |
|------------|---------|---------|
| **Firebase Auth** | 11.9 | Google OAuth with popup/redirect |
| **Cloud Firestore** | 11.9 | Real-time NoSQL database |
| **Firebase Analytics** | 11.9 | Usage tracking |
| **Google Maps API** | 1.1 | Interactive mapping |
| **Google Genkit** | 1.14 | AI flow orchestration |
| **Gemini 2.0 Flash** | Latest | LLM for predictions |

### DevOps & Monitoring
| Technology | Purpose |
|------------|---------|
| **Vercel Analytics** | Performance monitoring |
| **Vercel Speed Insights** | Core Web Vitals |
| **Turbopack** | Fast development builds |

---

## 🔧 Code Quality Audit (December 2024)

### ✅ Race Condition Fixes
All components audited and fixed for concurrent state issues:

| Component | Issue | Solution |
|-----------|-------|----------|
| `commute-dashboard.tsx` | Nested snapshot cleanup | `isMounted` flag + proper cleanup |
| `commute-dashboard.tsx` | Points update race | Firestore transactions |
| `commute-dashboard.tsx` | Redirect loop | Ref to track single redirect |
| `notification-bell.tsx` | Toast on every render | Ref to track previous count |
| `notification-bell.tsx` | Double-click accept | `isProcessing` state |
| `rewards.tsx` | Nested return in useEffect | Proper cleanup pattern |
| `profile.tsx` | State update after unmount | `isMounted` flag |
| `profile.tsx` | Toggle not optimistic | Optimistic update + rollback |
| `ride-sharing.tsx` | Past rides shown | Filter by date |
| `ride-sharing.tsx` | Double join request | `isJoining` state |
| `safety-shield.tsx` | Double delete contact | `isDeleting` state |
| `live-tracking.tsx` | Invalid vehicle data | Position validation |
| `post-ride-dialog.tsx` | Time input crash | Null check for date |
| `login/page.tsx` | Redirect not working | `onAuthStateChanged` listener |

### ✅ Cleanup Pattern Used
All `useEffect` hooks follow this safe pattern:

```typescript
React.useEffect(() => {
  let isMounted = true;
  let unsubscribeSnapshot: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
    if (!isMounted) return;
    // ... logic
  });

  return () => {
    isMounted = false;
    unsubscribeAuth();
    if (unsubscribeSnapshot) unsubscribeSnapshot();
  };
}, []);
```

### ✅ Edge Cases Handled
- **Empty states**: All lists show appropriate empty UI
- **Loading states**: Skeleton loaders during fetch
- **Error handling**: try-catch on all Firestore operations
- **Null checks**: Optional chaining for user data
- **Input validation**: Zod schemas for all forms
- **Past data filtering**: Rides sorted by date, expired excluded

---

## 📱 Mobile-First Design

### Design System

| Token | Value |
|-------|-------|
| **Border Radius** | `rounded-2xl` (16px) |
| **Touch Target** | Minimum 44px height |
| **Safe Areas** | `env(safe-area-inset-*)` |
| **Primary Gradient** | Emerald → Cyan |
| **Dark Background** | `#0A0A0F` |
| **Primary Color** | Indigo `#4F46E5` |
| **Accent Color** | Purple `#9333EA` |
| **Font Family** | Poppins |

### Navigation Pattern

```
┌─────────────────────────────────┐
│  [Logo]  Welcome   🔔 [Avatar]  │  ← Sticky Header (safe-top)
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │  [Gradient Points Card]     ││
│  └─────────────────────────────┘│
│                                 │
│  [🗺️ Track] [🚗 Rides] [🏆] [🎫]│  ← Quick Action Grid
│                                 │
│         [Page Content]          │
│                                 │
│                                 │
├─────────────────────────────────┤
│  🏠   👥   🏆   🛡️   👤         │  ← Bottom Nav (safe-bottom)
└─────────────────────────────────┘
```

### Mobile CSS Utilities

```css
/* Touch targets */
.touch-target { min-height: 44px; min-width: 44px; }

/* Safe areas for notched phones */
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Full viewport height (accounts for mobile browsers) */
.min-h-screen-mobile { min-height: 100dvh; }

/* Touch feedback */
.touch-active:active { opacity: 0.7; transform: scale(0.95); }
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase project** with Firestore & Auth enabled
- **Google Maps API key** (Maps JavaScript API)
- **Gemini API key** (optional, for AI features)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/campuscommuteinfo/campuscommute.git
cd campus-commute

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run the development server
npm run dev

# 5. Open the app
# Navigate to http://localhost:9002
```

### Available Scripts

```bash
npm run dev          # Start dev server with Turbopack (port 9002)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run genkit:dev   # Start Genkit AI dev server
npm run genkit:watch # Genkit with hot reload
```

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Google AI (Gemini) - Optional for AI features
GEMINI_API_KEY="your_gemini_api_key"

# Google Maps - Required for live tracking
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Firebase Configuration - Required
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

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Authentication** → **Sign-in method**
3. Click **Google** → Toggle **Enable** → Save
4. Add your domain to **Authorized domains**

### 2. Deploy Security Rules

```bash
firebase login
firebase deploy --only firestore:rules
```

### 3. Security Rules Summary

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Read/write own data only
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Emergency contacts subcollection
      match /emergency_contacts/{contactId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Vehicles: Read-only for authenticated users
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
    }
    
    // Rides: Any authenticated user can read/create
    match /rides/{rideId} {
      allow read, create: if request.auth != null;
    }
    
    // Ride requests: Driver/requester access only
    match /ride_requests/{requestId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.driverId 
                        || request.auth.uid == resource.data.requesterId;
    }
    
    // Redeemed vouchers: User's own vouchers only
    match /redeemed_vouchers/{voucherId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🗃️ Database Schema

### Collections

#### `users/{userId}`
```typescript
{
  email: string;
  name: string;
  photoURL: string;
  points: number;
  profileComplete: boolean;
  newsletter?: boolean;
  createdAt: string; // ISO date
}
```

#### `users/{userId}/emergency_contacts/{contactId}`
```typescript
{
  name: string;
  relation: string;
  phone: string;
}
```

#### `vehicles/{vehicleId}`
```typescript
{
  id: string;
  type: "bus" | "cab";
  route: string;
  position: { latitude: number; longitude: number };
  crowdLevel?: "Green" | "Yellow" | "Red";
}
```

#### `rides/{rideId}`
```typescript
{
  driverId: string;
  driverName: string;
  driverPhotoUrl: string;
  from: string;
  to: string;
  rideDate: string; // ISO date
  seats: number;
  price: number;
  genderPreference: "any" | "female";
  isSmokingAllowed: boolean;
  isMusicAllowed: boolean;
  createdAt: Timestamp;
}
```

#### `ride_requests/{requestId}`
```typescript
{
  rideId: string;
  driverId: string;
  requesterId: string;
  requesterName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Timestamp;
}
```

#### `redeemed_vouchers/{voucherId}`
```typescript
{
  userId: string;
  title: string;
  points: number;
  redeemedAt: Timestamp;
}
```

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- [x] Google Sign-In (popup + redirect fallback)
- [x] Mobile-first responsive design
- [x] Race condition fixes across all components
- [x] Firestore transactions for points
- [x] Real-time ride sharing with filtering
- [x] Gamified rewards with transaction-safe redemption
- [x] Emergency SOS with vibration feedback
- [x] AI crowd predictions (Gemini 2.0)
- [x] Comprehensive error handling
- [x] Offline persistence (IndexedDB)
- [x] Dark theme landing page

### 🔜 Coming Soon (v1.1)
- [ ] Push notifications for ride updates
- [ ] Payment integration (UPI/Razorpay)
- [ ] Real-time chat between riders
- [ ] Admin dashboard for vehicle management
- [ ] QR code generation for vouchers
- [ ] Real GPS vehicle data integration

### 📋 Backlog
- [ ] Route optimization AI
- [ ] Carbon footprint tracking
- [ ] University ID verification
- [ ] Split fare calculator
- [ ] Multi-language support

### Known Limitations
- Vehicle data is currently mocked
- QR codes for vouchers are placeholder
- Bus stops are pre-defined (not dynamic)
- No payment processing

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- Zod for validation
- Proper cleanup in useEffect

---

## 📄 License

This project is developed as a **Final Year Project** at Sharda University, Knowledge Park, Greater Noida.

---

## 📞 Contact

| Channel | Link |
|---------|------|
| **Email** | campuscommute.info@gmail.com |
| **GitHub** | [campuscommuteinfo/campuscommute](https://github.com/campuscommuteinfo/campuscommute) |
| **Location** | Sharda University, Knowledge Park, Greater Noida |

---

## 🙏 Acknowledgements

- **Sharda University** - For project guidance
- **Firebase** - Backend infrastructure
- **Google** - Maps & Gemini AI APIs
- **Vercel** - Hosting & analytics
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Component inspiration

---

<p align="center">
  Made with ❤️ for the campus community
  <br>
  <strong>© 2025 Commute Companion. All rights reserved.</strong>
</p>
