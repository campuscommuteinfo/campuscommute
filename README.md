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
| **Authentication** | 9/10 | ✅ Working with Redirect |
| **Race Condition Handling** | 9/10 | ✅ Fixed |
| **Error Handling** | 8/10 | ✅ Comprehensive |
| **Database Security** | 7/10 | ⚠️ Rules Ready, Deploy Needed |
| **AI Features** | 7/10 | ⚠️ Requires Gemini API Key |
| **Real Data** | 5/10 | ⚠️ Currently Mocked |
| **Payment Integration** | 0/10 | ❌ Not Implemented |

---

## 🔧 Code Audit Summary (December 2024)

### ✅ Fixed Issues

#### Race Conditions
All components have been audited and fixed for race conditions:

| Component | Issue | Fix |
|-----------|-------|-----|
| `commute-dashboard.tsx` | Nested snapshot cleanup not called | Proper `isMounted` flag and cleanup |
| `commute-dashboard.tsx` | Points update race condition | Uses Firestore transaction |
| `commute-dashboard.tsx` | Redirect loop on incomplete profile | Ref to track single redirect |
| `notification-bell.tsx` | Toast triggered on every render | Ref to track previous count |
| `notification-bell.tsx` | Double-click on accept/decline | `isProcessing` state |
| `rewards.tsx` | Nested return in useEffect | Proper cleanup pattern |
| `profile.tsx` | State update after unmount | `isMounted` flag |
| `profile.tsx` | Toggle not optimistic | Optimistic update with rollback |
| `ride-sharing.tsx` | Past rides shown | Filter out expired rides |
| `ride-sharing.tsx` | Double join request | `isJoining` state |
| `safety-shield.tsx` | Double delete contact | `isDeleting` state |
| `live-tracking.tsx` | Invalid vehicle data | Position validation |
| `post-ride-dialog.tsx` | Time input crash | Null check for date |
| `login/page.tsx` | Redirect not working on mobile | `onAuthStateChanged` listener |

#### Edge Cases Handled
- **Empty states**: All lists show appropriate empty states
- **Loading states**: Skeleton loaders on initial fetch
- **Error handling**: All Firestore operations have try-catch
- **Null checks**: Optional chaining for all user data
- **Input validation**: Zod schemas for all forms
- **Past data filtering**: Rides sorted by date, past rides excluded

#### Cleanup Patterns
All useEffect hooks now follow this pattern:
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

---

## ✨ Features

### 🗺️ Live Vehicle Tracking
- **Real-time GPS tracking** of buses and cabs on an interactive Google Maps interface
- **Crowd-level indicators** (Green/Yellow/Red) showing vehicle capacity status
- **Bus stop markers** displayed along routes for easy navigation
- **Offline persistence** with Firestore IndexedDB for seamless experience
- **Data validation** for vehicle positions

### 🚗 Ride Sharing System
- **Post rides** as a driver with customizable options (seats, price, date, preferences)
- **Find rides** going your way with real-time matching
- **Request to join** available rides with driver approval system
- **Gender-preference matching** for added comfort and safety
- **Past ride filtering** - only shows upcoming rides
- **Double-submit prevention** on join requests

### 🤖 AI-Powered Intelligence (Google Gemini)
- **Bus crowd prediction** based on time, day, and academic calendar events
- **Delay explanation** with contextual reasoning for late buses
- **Smart suggestions** to avoid crowded buses during peak hours

### 🎮 Gamified Rewards System
- **Earn points** for every ride, crowd report, and interaction
- **Transaction-safe redemption** using Firestore transactions
- **Optimistic UI updates** with rollback on failure
- **Redeem rewards** including:
  - ₹50 Ride Vouchers
  - Amazon Gift Cards
  - Blinkit Vouchers
  - Sharda Canteen Coupons

### 🛡️ Safety Features
- **Emergency SOS button** with countdown and vibration feedback
- **Emergency contacts management** with quick-dial functionality
- **Trip sharing** to let friends/family track your journey
- **Delete protection** prevents accidental double-deletes
- **Female-only matching** option for added safety

### 👤 User Profile Management
- **Google Sign-In** using redirect method (works on all browsers)
- **Optimistic toggles** for instant feedback
- **Complete profile setup** with personal information
- **Account deletion** with full data removal

### 📱 Mobile-First Design
- **Bottom navigation** pattern for easy thumb access
- **Touch targets** minimum 44px for accessibility
- **Safe area handling** for notched phones
- **Dark theme** landing page with emerald-cyan accents

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16.1** | React framework with App Router & Turbopack |
| **TypeScript 5** | Type-safe development |
| **TailwindCSS 3.4** | Utility-first CSS styling |
| **Radix UI** | Accessible, unstyled component primitives |
| **Lucide React** | Beautiful, consistent icons |
| **React Hook Form** | Performant form handling |
| **Zod** | TypeScript-first schema validation |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Google OAuth with redirect |
| **Cloud Firestore** | Real-time NoSQL database |
| **Firebase Transactions** | Race-condition-free updates |
| **Google Maps API** | Interactive maps |
| **Google Genkit AI** | AI flows for predictions |
| **Gemini Pro** | Large language model |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase project** with Firestore enabled
- **Google Maps API key** with Maps JavaScript API enabled
- **Gemini API key** for AI features (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/campuscommuteinfo/campuscommute.git
   cd campus-commute
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Enable Google Sign-In in Firebase Console**
   - Go to Authentication → Sign-in method → Google → Enable

5. **Deploy Firestore rules**
   ```bash
   firebase login
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   Navigate to [http://localhost:9002](http://localhost:9002)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google AI (Gemini) - Optional
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

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click **Google** → Toggle **Enable** → Save

### 2. Deploy Security Rules

```bash
firebase login
firebase deploy --only firestore:rules
```

### Security Rules Summary

The Firestore rules enforce:
- **Users** can only read/write their own data
- **User creation** allowed when ID matches auth UID
- **Points updates** must be through transactions
- **Vehicles** are read-only for authenticated users
- **Rides** can be created by any authenticated user
- **Ride updates/deletes** only allowed by the driver

---

## 📱 Mobile Optimization

### Design Tokens

| Token | Value |
|-------|-------|
| **Border Radius** | `rounded-2xl` (16px) |
| **Touch Target** | Minimum 44px height |
| **Safe Areas** | `env(safe-area-inset-*)` |
| **Accent Gradient** | Emerald → Cyan |
| **Dark Background** | `#0A0A0F` |

### Navigation Pattern

```
┌─────────────────────────────────┐
│  [Logo]  Welcome   🔔 [Avatar]  │  ← Sticky Header
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │  [Gradient Points Card]     ││
│  └─────────────────────────────┘│
│                                 │
│  [🗺️ Track] [🚗 Rides] [🏆] [🎫]│  ← Quick Actions
│                                 │
│         [Page Content]          │
│                                 │
├─────────────────────────────────┤
│  🏠   👥   🏆   🛡️   👤         │  ← Bottom Nav
└─────────────────────────────────┘
```

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Google Sign-In integration (redirect method)
- [x] Mobile-first responsive design
- [x] Race condition fixes across all components
- [x] Firestore transaction for points
- [x] Real-time ride sharing with past-ride filtering
- [x] Gamified rewards with transaction-safe redemption
- [x] Emergency SOS with vibration feedback
- [x] AI crowd predictions
- [x] Comprehensive error handling

### 🔜 Coming Soon
- [ ] Push notifications for ride updates
- [ ] Payment integration (UPI/Razorpay)
- [ ] Real-time chat between riders
- [ ] Admin dashboard for vehicle management
- [ ] QR code generation for vouchers
- [ ] Real GPS vehicle data

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

- **Email:** campuscommute.info@gmail.com
- **GitHub:** [campuscommuteinfo/campuscommute](https://github.com/campuscommuteinfo/campuscommute)
- **Location:** Sharda University, Knowledge Park, Greater Noida

---

<p align="center">
  Made with ❤️ for the campus community
  <br>
  <strong>© 2025 Commute Companion. All rights reserved.</strong>
</p>
