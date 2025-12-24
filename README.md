# 🚌 Commute Companion

**AI-Powered Campus Ride-Pooling Platform for Students**

Commute Companion is a modern, mobile-first transportation platform designed specifically for students in Knowledge Park, Greater Noida. It connects daily commuters to share rides, track buses in real-time, and travel affordably with verified co-travellers.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.9-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Genkit AI](https://img.shields.io/badge/Genkit_AI-1.14-purple?style=flat-square)

---

## 🌟 Key Highlights

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Tracking** | Real-time GPS tracking with Google Maps integration |
| 🚗 **Ride Sharing** | Peer-to-peer ride matching with driver/passenger system |
| 🤖 **AI Intelligence** | Gemini 2.0-powered crowd predictions & delay explanations |
| 🎮 **Gamification** | Points-based rewards with redeemable vouchers |
| 🛡️ **Safety First** | Emergency SOS, trip sharing, emergency contacts |
| 📱 **Mobile-First** | Responsive design with PWA-ready features |

---

## 📁 Project Structure

```
campus-commute/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page (416 lines)
│   │   ├── layout.tsx                # Root layout with metadata
│   │   ├── globals.css               # Global styles & CSS variables
│   │   ├── login/
│   │   │   └── page.tsx              # Google OAuth login (458 lines)
│   │   └── dashboard/                # Protected dashboard area
│   │       ├── page.tsx              # Home with live tracking
│   │       ├── layout.tsx            # Dashboard wrapper with nav
│   │       ├── ride-sharing/         # Find & post rides
│   │       ├── rewards/              # Points & redemption
│   │       ├── safety/               # Emergency SOS & contacts
│   │       ├── profile/              # User profile management
│   │       └── my-rides/             # Redeemed vouchers
│   │
│   ├── components/                   # React components (47 files)
│   │   ├── ui/                       # 34 Radix UI primitives (shadcn/ui)
│   │   │   ├── button.tsx            # Button variants
│   │   │   ├── card.tsx              # Card components
│   │   │   ├── dialog.tsx            # Modal dialogs
│   │   │   ├── form.tsx              # Form utilities
│   │   │   ├── toast.tsx             # Toast notifications
│   │   │   └── ... (29 more)         # Full shadcn/ui library
│   │   │
│   │   ├── commute-dashboard.tsx     # Main dashboard wrapper (408 lines)
│   │   ├── live-tracking.tsx         # Google Maps integration (274 lines)
│   │   ├── ride-sharing.tsx          # Ride matching system (348 lines)
│   │   ├── rewards.tsx               # Points & redemption (284 lines)
│   │   ├── safety-shield.tsx         # SOS & emergency contacts (335 lines)
│   │   ├── profile.tsx               # User settings (360 lines)
│   │   ├── vehicle-card.tsx          # AI-powered vehicle info (303 lines)
│   │   ├── notification-bell.tsx     # Ride request notifications (181 lines)
│   │   ├── post-ride-dialog.tsx      # Create new ride (234 lines)
│   │   ├── my-free-rides.tsx         # Voucher management (166 lines)
│   │   ├── crowd-report-dialog.tsx   # Report crowd levels
│   │   ├── add-emergency-contact-dialog.tsx
│   │   └── logo.tsx                  # Brand logo component
│   │
│   ├── ai/                           # Google Genkit AI
│   │   ├── genkit.ts                 # Genkit configuration (Gemini 2.0 Flash)
│   │   ├── dev.ts                    # Development server
│   │   └── flows/
│   │       ├── predict-bus-crowd-levels.ts  # Crowd prediction AI
│   │       └── explain-bus-delays.ts        # Delay explanation AI
│   │
│   ├── lib/                          # Utilities & configuration
│   │   ├── firebase.ts               # Firebase client setup
│   │   ├── types.ts                  # TypeScript interfaces
│   │   ├── bus-stops.ts              # Route stop data (3 routes)
│   │   └── utils.ts                  # Helper functions (cn utility)
│   │
│   └── hooks/                        # Custom React hooks
│       ├── use-toast.ts              # Toast notifications
│       └── use-mobile.tsx            # Responsive detection
│
├── public/                           # Static assets
├── firestore.rules                   # Database security rules
├── firebase.json                     # Firebase configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── components.json                   # shadcn/ui configuration
└── package.json                      # Dependencies & scripts
```

---

## ✨ Features Deep Dive

### 🗺️ Live Vehicle Tracking

Real-time GPS tracking system with interactive Google Maps integration.

| Feature | Implementation |
|---------|----------------|
| **Interactive Map** | `@vis.gl/react-google-maps` v1.1.0 |
| **Vehicle Markers** | Color-coded pins (Bus 🟢/Cab 🔵) with crowd indicators |
| **Bus Stop Display** | Route-specific stops with position markers |
| **Map Controls** | Zoom, center, layer toggle, locate me button |
| **Real-time Updates** | Firestore `onSnapshot` listeners |
| **Offline Support** | IndexedDB persistence enabled |
| **Vehicle Selection** | Tap marker → AI-powered info card |

**Supported Routes:**
- **73A**: Sharda University → GNIOT → Knowledge Park II Metro → Pari Chowk → Alpha I
- **100B**: Galgotias University → Yamuna Expressway → Knowledge Park II Metro → Jagdishpur
- **45**: Pari Chowk → Ansal Plaza → Sector 37 → Botanical Garden Metro

---

### 🚗 Ride Sharing System

Complete peer-to-peer ride-sharing with driver/passenger matching.

| Feature | Implementation |
|---------|----------------|
| **Post Rides** | Create rides with date, seats, price, preferences |
| **Find Rides** | Real-time list with filters (upcoming only) |
| **Join Requests** | Request system with driver approval |
| **Notifications** | Real-time bell with accept/decline actions |
| **Preferences** | Gender matching, smoking, music options |
| **Validation** | Zod schemas for all form inputs |
| **Race Protection** | `isJoining` / `isProcessing` states |

**Form Validation Schema:**
```typescript
const rideSchema = z.object({
  from: z.string().min(2, "Please enter a starting location."),
  to: z.string().min(2, "Please enter a destination."),
  rideDate: z.date({ required_error: "Please select a date and time." }),
  seats: z.coerce.number().min(1, "Must offer at least one seat."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});
```

---

### 🤖 AI-Powered Intelligence

Two AI flows built with **Google Genkit 1.14** + **Gemini 2.0 Flash** for intelligent predictions.

#### Crowd Level Prediction
```typescript
// Input
{ routeId: "73A", time: "8:30 AM", dayOfWeek: "Monday", academicCalendarEvents?: "Exams" }

// Output
{ crowdLevel: "Green" | "Yellow" | "Red", explanation: "Expected moderate crowd..." }
```

**Intelligence Factors:**
- Class schedules (9 AM - 5 PM)
- Peak hour awareness (8-10 AM, 4-6 PM)
- Weekend/holiday adjustments
- Academic calendar events

#### Bus Delay Explanation
```typescript
// Input
{ route: "73A", stop: "Sharda University Gate 1" }

// Output
{ explanation: "The delay may be due to heavy traffic..." }
```

**Context Factors:**
- Traffic patterns
- Weather conditions
- Special events
- Time of day

---

### 🎮 Gamified Rewards System

Points-based engagement with transaction-safe redemption.

| Reward | Points | Category | Icon |
|--------|--------|----------|------|
| ₹50 Ride Voucher | 200 | Transport | 🎫 |
| Amazon Gift Card | 500 | Shopping | 🛒 |
| Blinkit Voucher | 400 | Groceries | 🛒 |
| Canteen Coupon | 300 | Campus | 🍴 |

**Technical Implementation:**
- Firestore transactions for atomic point updates
- Optimistic UI updates with rollback on failure
- Real-time point synchronization via `onSnapshot`
- QR code display for vouchers (placeholder)

---

### 🛡️ Safety Features

Comprehensive safety toolkit for secure commuting.

| Feature | Description |
|---------|-------------|
| **Emergency SOS** | 5-second countdown timer with vibration feedback |
| **Emergency Contacts** | Add/delete contacts with quick dial |
| **Trip Sharing** | Share journey via Web Share API |
| **Female-Only Option** | Gender preference filtering for rides |
| **Delete Protection** | `isDeleting` state prevents accidental double-deletes |

---

### 👤 User Profile Management

Complete profile system with preference management.

| Feature | Implementation |
|---------|----------------|
| **Google Sign-In** | Popup with redirect fallback |
| **Display Name** | Editable with save |
| **Newsletter Toggle** | Optimistic UI updates + rollback |
| **Account Deletion** | Full data removal with confirmation |
| **Avatar Display** | Google profile photo or initials |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1 | React framework with App Router & Turbopack |
| **React** | 19.2 | UI library with latest features |
| **TypeScript** | 5.x | Type-safe development |
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
| **Font Family** | Poppins (400, 500, 600, 700) |

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
.safe-all { padding: env(safe-area-inset-top) env(safe-area-inset-right) 
                      env(safe-area-inset-bottom) env(safe-area-inset-left); }

/* Full viewport height (accounts for mobile browsers) */
.min-h-screen-mobile { min-height: 100vh; min-height: 100dvh; }

/* Touch feedback */
.touch-active:active { opacity: 0.7; transform: scale(0.95); }
```

### Custom Animations

```css
@keyframes slide-up { from { transform: translateY(100%); opacity: 0; } 
                      to { transform: translateY(0); opacity: 1; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes scale-in { from { transform: scale(0.9); opacity: 0; } 
                      to { transform: scale(1); opacity: 1; } }
```

---

## 🔧 Code Quality

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

### ✅ Cleanup Pattern

All `useEffect` hooks follow this safe pattern:

```typescript
React.useEffect(() => {
  let isMounted = true;
  let unsubscribe: (() => void) | null = null;

  const init = async () => {
    if (!isMounted) return;
    // ... setup logic
  };

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!isMounted) return;
    // ... auth logic
  });

  return () => {
    isMounted = false;
    unsubscribeAuth();
    if (unsubscribe) unsubscribe();
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

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack (port 9002) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run genkit:dev` | Start Genkit AI dev server |
| `npm run genkit:watch` | Genkit with hot reload |

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
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Read/write own data only
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /emergency_contacts/{contactId} {
        allow read, write, delete: if request.auth.uid == userId;
      }
    }
    
    // Vehicles: Read-only for authenticated users
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
    }
    
    // Vehicle Reports: Create-only
    match /vehicle_reports/{reportId} {
      allow create: if request.auth != null;
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

#### `vehicle_reports/{reportId}`
```typescript
{
  vehicleId: string;
  reportType: string;
  crowdLevel?: string;
  createdAt: Timestamp;
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
- [x] 34 shadcn/ui components
- [x] Vercel Analytics & Speed Insights
- [x] PWA-ready metadata

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
- [ ] Multi-language support (Hindi, English)
- [ ] Driver rating system
- [ ] Scheduled rides

### ⚠️ Known Limitations

| Limitation | Status |
|------------|--------|
| Vehicle data is currently mocked | Planned for v1.1 |
| QR codes for vouchers are placeholder | Planned |
| Bus stops are pre-defined (not dynamic) | By design |
| No payment processing | Planned for v1.1 |
| AI requires Gemini API key | Optional feature |

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Total Components** | 47 files |
| **UI Components** | 34 shadcn/ui primitives |
| **Custom Components** | 13 feature components |
| **Total Lines of Code** | ~5,000+ |
| **AI Flows** | 2 (crowd prediction, delay explanation) |
| **Firestore Collections** | 6 |
| **Bus Routes** | 3 |
| **Reward Types** | 4 |

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
- `isMounted` pattern for async operations

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
- **Lucide** - Beautiful icon set

---

<p align="center">
  Made with ❤️ for the campus community
  <br>
  <strong>© 2025 Commute Companion. All rights reserved.</strong>
</p>
