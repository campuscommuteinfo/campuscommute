"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { auth, db, googleProvider } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Users, Sparkles } from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================
const REDIRECT_FLAG_KEY = "google_auth_redirect_pending";
const AUTH_CHECK_TIMEOUT = 5000; // Max time to wait for auth state

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect if the current device is mobile
 * Uses multiple signals for reliability
 */
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Primary: User agent check (most reliable)
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    navigator.userAgent
  );

  // Secondary: Touch + small screen
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  // Tertiary: Check if it's a standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return mobileUA || (hasTouchScreen && isSmallScreen) || isStandalone;
};

/**
 * Set redirect flag in localStorage (more reliable than sessionStorage on mobile)
 */
const setRedirectPending = (): void => {
  try {
    localStorage.setItem(REDIRECT_FLAG_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to set redirect flag:", e);
  }
};

/**
 * Check if we're returning from a redirect (within last 5 minutes)
 */
const isRedirectPending = (): boolean => {
  try {
    const timestamp = localStorage.getItem(REDIRECT_FLAG_KEY);
    if (!timestamp) return false;

    const elapsed = Date.now() - parseInt(timestamp, 10);
    // Consider redirect valid for 5 minutes
    return elapsed < 5 * 60 * 1000;
  } catch (e) {
    return false;
  }
};

/**
 * Clear the redirect flag
 */
const clearRedirectFlag = (): void => {
  try {
    localStorage.removeItem(REDIRECT_FLAG_KEY);
  } catch (e) {
    console.warn("Failed to clear redirect flag:", e);
  }
};

/**
 * Navigate to dashboard - uses window.location for reliability on mobile
 */
const navigateToDashboard = (): void => {
  // Clear any pending flags before redirect
  clearRedirectFlag();

  // Use replace to prevent back button issues
  window.location.replace("/dashboard");
};

// ============================================================================
// AUTH STATE TYPES
// ============================================================================
type AuthState =
  | { status: "loading" }
  | { status: "checking_redirect" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LoginPage() {
  const { toast } = useToast();
  const [authState, setAuthState] = React.useState<AuthState>({ status: "loading" });
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [debugLog, setDebugLog] = React.useState<string[]>([]);

  // Ref to track if we've already handled navigation
  const hasNavigatedRef = React.useRef(false);

  // Debug logger
  const log = React.useCallback((message: string) => {
    console.log(`[Auth] ${message}`);
    setDebugLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  /**
   * Process authenticated user - create/update Firestore doc and navigate
   */
  const processAuthenticatedUser = React.useCallback(async (user: User, isNewSignIn: boolean = false) => {
    // Prevent double navigation
    if (hasNavigatedRef.current) {
      log("Navigation already in progress, skipping...");
      return;
    }
    hasNavigatedRef.current = true;

    log(`Processing user: ${user.email}`);

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        log("Creating new user document...");
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          points: 0,
          profileComplete: true,
          createdAt: new Date().toISOString(),
        });

        toast({
          title: "Welcome! 🎉",
          description: "Your account has been created.",
        });
      } else if (isNewSignIn) {
        toast({
          title: "Welcome back! 👋",
          description: "Signed in successfully.",
        });
      }

      log("Navigating to dashboard...");
      navigateToDashboard();

    } catch (error) {
      console.error("Error processing user:", error);
      hasNavigatedRef.current = false;
      setAuthState({
        status: "error",
        message: "Failed to set up your account. Please try again."
      });
    }
  }, [toast, log]);

  /**
   * Main auth initialization effect
   * Handles: redirect result, existing auth state, and race conditions
   */
  React.useEffect(() => {
    let isMounted = true;
    let authUnsubscribe: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      const pendingRedirect = isRedirectPending();
      log(`Init auth - Pending redirect: ${pendingRedirect}`);

      if (pendingRedirect) {
        setAuthState({ status: "checking_redirect" });
      }

      // STEP 1: Check for redirect result first (must be done before onAuthStateChanged)
      try {
        log("Checking redirect result...");
        const result = await getRedirectResult(auth);

        if (result?.user) {
          log("Got user from redirect result!");
          clearRedirectFlag();
          if (isMounted) {
            setAuthState({ status: "authenticated", user: result.user });
            await processAuthenticatedUser(result.user, true);
          }
          return; // Exit early - user is handled
        } else {
          log("No user in redirect result");
        }
      } catch (error) {
        log(`Redirect result error: ${error instanceof FirebaseError ? error.code : error}`);
        clearRedirectFlag();
        // Don't return - continue to check auth state
      }

      // STEP 2: Set up auth state listener
      log("Setting up auth state listener...");

      // Set a timeout to ensure we don't wait forever
      timeoutId = setTimeout(() => {
        if (isMounted && authState.status === "loading") {
          log("Auth check timeout - showing login form");
          setAuthState({ status: "unauthenticated" });
          clearRedirectFlag();
        }
      }, AUTH_CHECK_TIMEOUT);

      authUnsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;

        // Clear timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (user) {
          log(`Auth state: User found (${user.email})`);
          clearRedirectFlag();
          setAuthState({ status: "authenticated", user });
          await processAuthenticatedUser(user, pendingRedirect);
        } else {
          log("Auth state: No user");

          // If we were expecting a redirect result but didn't get it,
          // wait a bit more as Firebase might still be processing
          if (pendingRedirect) {
            log("Waiting extra time for redirect auth to settle...");

            // Check if auth.currentUser becomes available
            const checkInterval = setInterval(() => {
              if (auth.currentUser) {
                clearInterval(checkInterval);
                if (isMounted) {
                  log("Found user via currentUser check");
                  clearRedirectFlag();
                  setAuthState({ status: "authenticated", user: auth.currentUser });
                  processAuthenticatedUser(auth.currentUser, true);
                }
              }
            }, 500);

            // Give up after 3 more seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              if (isMounted && !auth.currentUser) {
                log("No user found after extended wait");
                clearRedirectFlag();
                setAuthState({ status: "unauthenticated" });
              }
            }, 3000);
          } else {
            setAuthState({ status: "unauthenticated" });
          }
        }
      });
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authUnsubscribe) authUnsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [processAuthenticatedUser, log]);

  /**
   * Handle Google Sign In button click
   */
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);

    const mobile = isMobileDevice();
    log(`Sign in clicked - Mobile: ${mobile}`);

    try {
      if (mobile) {
        // MOBILE: Always use redirect
        log("Using redirect flow for mobile...");
        setRedirectPending();
        await signInWithRedirect(auth, googleProvider);
        // Page will redirect - this code won't continue
        return;
      }

      // DESKTOP: Try popup first, fallback to redirect
      try {
        log("Trying popup for desktop...");
        const result = await signInWithPopup(auth, googleProvider);

        if (result.user) {
          log("Popup successful!");
          setAuthState({ status: "authenticated", user: result.user });
          await processAuthenticatedUser(result.user, true);
          return;
        }
      } catch (popupError) {
        if (popupError instanceof FirebaseError) {
          const recoverableCodes = [
            "auth/popup-blocked",
            "auth/popup-closed-by-user",
            "auth/cancelled-popup-request"
          ];

          if (recoverableCodes.includes(popupError.code)) {
            log(`Popup failed (${popupError.code}), falling back to redirect...`);
            setRedirectPending();
            await signInWithRedirect(auth, googleProvider);
            return;
          }
          throw popupError;
        }
        throw popupError;
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsSigningIn(false);
      clearRedirectFlag();

      let description = "An unexpected error occurred. Please try again.";

      if (error instanceof FirebaseError) {
        log(`Sign-in error: ${error.code}`);

        switch (error.code) {
          case "auth/unauthorized-domain":
            description = "This domain is not authorized for sign-in. Please contact support.";
            break;
          case "auth/operation-not-allowed":
            description = "Google Sign-In is not enabled. Please contact support.";
            break;
          case "auth/network-request-failed":
            description = "Network error. Please check your connection and try again.";
            break;
          case "auth/internal-error":
            description = "Authentication error. Please try again or clear your browser data.";
            break;
          case "auth/user-cancelled":
            description = "Sign-in was cancelled.";
            break;
          default:
            description = `Sign-in failed: ${error.message}`;
        }
      }

      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description,
      });

      setAuthState({ status: "unauthenticated" });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading states
  if (authState.status === "loading" || authState.status === "checking_redirect" || authState.status === "authenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
            {authState.status === "checking_redirect"
              ? "Completing sign in..."
              : authState.status === "authenticated"
                ? "Redirecting to dashboard..."
                : "Loading..."}
          </p>
          {/* Debug info - always show on mobile for now */}
          {debugLog.length > 0 && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg max-w-xs">
              <p className="text-gray-500 text-xs font-mono mb-2">Debug Log:</p>
              {debugLog.map((msg, i) => (
                <p key={i} className="text-gray-600 text-xs font-mono">{msg}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (authState.status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size="lg" />
          <p className="text-red-400 text-sm">{authState.message}</p>
          <Button
            onClick={() => setAuthState({ status: "unauthenticated" })}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main login form
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] safe-all">
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Back button */}
      <div className="relative p-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Logo and heading */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-white/5 backdrop-blur-sm rounded-3xl mb-6 border border-white/10">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue your journey
          </p>
        </div>

        {/* Sign in card */}
        <div className="w-full max-w-sm">
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-100 text-gray-900 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </div>
            )}
          </Button>

          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0A0A0F] px-4 text-xs text-gray-500">Why sign in?</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              { icon: Zap, text: "Instant access, no passwords", color: "text-yellow-400" },
              { icon: Shield, text: "Your data stays secure", color: "text-emerald-400" },
              { icon: Users, text: "Join 500+ students", color: "text-cyan-400" },
              { icon: Sparkles, text: "Earn rewards on every ride", color: "text-pink-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-gray-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-gray-500 text-xs mt-10 max-w-xs">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-emerald-400 hover:underline">Terms</Link> and{" "}
          <Link href="#" className="text-emerald-400 hover:underline">Privacy Policy</Link>
        </p>

        {/* Debug info */}
        {debugLog.length > 0 && (
          <div className="mt-6 p-3 bg-gray-900/50 rounded-lg max-w-xs w-full">
            <p className="text-gray-500 text-xs font-mono mb-2">Debug:</p>
            {debugLog.slice(-5).map((msg, i) => (
              <p key={i} className="text-gray-600 text-xs font-mono truncate">{msg}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
