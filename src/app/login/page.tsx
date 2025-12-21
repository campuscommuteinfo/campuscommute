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
const AUTH_INIT_TIMEOUT = 8000; // Max time to wait for auth initialization

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect if the current device is mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    navigator.userAgent
  );

  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return mobileUA || (hasTouchScreen && isSmallScreen) || isStandalone;
};

/**
 * Navigate to dashboard - uses window.location for reliability
 */
const navigateToDashboard = (): void => {
  window.location.replace("/dashboard");
};

// ============================================================================
// AUTH STATE TYPES
// ============================================================================
type AuthState =
  | { status: "initializing" }
  | { status: "checking_redirect" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "signing_in" }
  | { status: "error"; message: string };

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LoginPage() {
  const { toast } = useToast();
  const [authState, setAuthState] = React.useState<AuthState>({ status: "initializing" });
  const [debugLog, setDebugLog] = React.useState<string[]>([]);

  // Refs to prevent race conditions
  const hasNavigatedRef = React.useRef(false);
  const isInitializedRef = React.useRef(false);

  // Debug logger
  const log = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[Auth ${timestamp}] ${message}`);
    setDebugLog(prev => [...prev.slice(-14), `${timestamp}: ${message}`]);
  }, []);

  /**
   * Process authenticated user - create/update Firestore doc and navigate
   */
  const processAuthenticatedUser = React.useCallback(async (user: User, showToast: boolean = false) => {
    if (hasNavigatedRef.current) {
      log("Already navigating, skip...");
      return;
    }
    hasNavigatedRef.current = true;

    log(`Processing: ${user.email}`);
    setAuthState({ status: "authenticated", user });

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        log("Creating user doc...");
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
      } else if (showToast) {
        toast({
          title: "Welcome back! 👋",
          description: "Signed in successfully.",
        });
      }

      log("→ Dashboard");
      navigateToDashboard();

    } catch (error) {
      console.error("Error processing user:", error);
      log(`Error: ${error}`);
      hasNavigatedRef.current = false;
      setAuthState({
        status: "error",
        message: "Failed to set up your account. Please try again."
      });
    }
  }, [toast, log]);

  /**
   * Main auth initialization - NO storage dependencies
   * Relies purely on Firebase's getRedirectResult and onAuthStateChanged
   */
  React.useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    let isMounted = true;
    let authUnsubscribe: (() => void) | null = null;
    let initTimeoutId: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      log("Init started");
      log(`Mobile: ${isMobileDevice()}`);
      log(`URL: ${window.location.href}`);

      // STEP 1: Always check for redirect result first
      // This is the ONLY way to get user after signInWithRedirect
      setAuthState({ status: "checking_redirect" });

      try {
        log("Checking getRedirectResult...");
        const result = await getRedirectResult(auth);

        if (result?.user) {
          log(`Redirect user: ${result.user.email}`);
          if (isMounted) {
            await processAuthenticatedUser(result.user, true);
          }
          return; // Done - user handled
        }
        log("No redirect result");
      } catch (error) {
        if (error instanceof FirebaseError) {
          log(`Redirect error: ${error.code}`);
          // auth/popup-closed-by-user is not really an error
          if (error.code !== "auth/popup-closed-by-user") {
            console.error("Redirect result error:", error);
          }
        } else {
          log(`Redirect error: ${error}`);
        }
      }

      // STEP 2: Set up auth state listener
      // This catches: already signed in users, and any auth state changes
      log("Setting up onAuthStateChanged...");

      authUnsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;

        // Clear init timeout since we got a response
        if (initTimeoutId) {
          clearTimeout(initTimeoutId);
          initTimeoutId = null;
        }

        if (user) {
          log(`onAuthStateChanged: ${user.email}`);
          await processAuthenticatedUser(user, false);
        } else {
          log("onAuthStateChanged: null");

          // Double-check currentUser (sometimes it's set before listener fires)
          if (auth.currentUser) {
            log(`Found currentUser: ${auth.currentUser.email}`);
            await processAuthenticatedUser(auth.currentUser, false);
          } else {
            setAuthState({ status: "unauthenticated" });
          }
        }
      });

      // STEP 3: Safety timeout - if nothing happens, show login form
      initTimeoutId = setTimeout(() => {
        if (isMounted && !hasNavigatedRef.current) {
          log("Timeout - showing login");

          // Final check for currentUser
          if (auth.currentUser) {
            log(`Timeout found currentUser: ${auth.currentUser.email}`);
            processAuthenticatedUser(auth.currentUser, false);
          } else {
            setAuthState({ status: "unauthenticated" });
          }
        }
      }, AUTH_INIT_TIMEOUT);
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authUnsubscribe) authUnsubscribe();
      if (initTimeoutId) clearTimeout(initTimeoutId);
    };
  }, [processAuthenticatedUser, log]);

  /**
   * Handle Google Sign In button click
   */
  const handleGoogleSignIn = async () => {
    setAuthState({ status: "signing_in" });

    const mobile = isMobileDevice();
    log(`Sign in - Mobile: ${mobile}`);

    try {
      if (mobile) {
        // MOBILE: Use redirect - page will navigate away
        log("Using signInWithRedirect...");
        await signInWithRedirect(auth, googleProvider);
        // This line won't execute - browser redirects
        return;
      }

      // DESKTOP: Try popup first
      try {
        log("Trying signInWithPopup...");
        const result = await signInWithPopup(auth, googleProvider);

        if (result.user) {
          log(`Popup success: ${result.user.email}`);
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
            log(`Popup failed: ${popupError.code}, using redirect...`);
            await signInWithRedirect(auth, googleProvider);
            return;
          }
          throw popupError;
        }
        throw popupError;
      }
    } catch (error) {
      console.error("Sign-in error:", error);

      let description = "An unexpected error occurred. Please try again.";

      if (error instanceof FirebaseError) {
        log(`Error: ${error.code}`);

        switch (error.code) {
          case "auth/unauthorized-domain":
            description = "This domain is not authorized for sign-in.";
            break;
          case "auth/operation-not-allowed":
            description = "Google Sign-In is not enabled.";
            break;
          case "auth/network-request-failed":
            description = "Network error. Check your connection.";
            break;
          case "auth/internal-error":
            description = "Auth error. Try clearing browser data.";
            break;
          case "auth/user-cancelled":
            description = "Sign-in was cancelled.";
            break;
          default:
            description = error.message;
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

  // Loading/Redirect states - show spinner with debug log
  const isLoading = authState.status === "initializing" ||
    authState.status === "checking_redirect" ||
    authState.status === "authenticated" ||
    authState.status === "signing_in";

  if (isLoading) {
    const message = {
      initializing: "Loading...",
      checking_redirect: "Completing sign in...",
      authenticated: "Redirecting...",
      signing_in: "Signing in...",
    }[authState.status as string] || "Loading...";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <Logo size="lg" />
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">{message}</p>

          {/* Debug Log - Always visible for troubleshooting */}
          <div className="mt-4 p-3 bg-gray-900/80 rounded-lg w-full border border-gray-800">
            <p className="text-emerald-400 text-xs font-mono mb-2">Debug Log:</p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {debugLog.length === 0 ? (
                <p className="text-gray-600 text-xs font-mono">Waiting...</p>
              ) : (
                debugLog.map((msg, i) => (
                  <p key={i} className="text-gray-400 text-xs font-mono">{msg}</p>
                ))
              )}
            </div>
          </div>
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

          {/* Debug Log */}
          <div className="mt-4 p-3 bg-gray-900/80 rounded-lg w-full max-w-sm border border-gray-800">
            <p className="text-red-400 text-xs font-mono mb-2">Debug Log:</p>
            {debugLog.map((msg, i) => (
              <p key={i} className="text-gray-400 text-xs font-mono">{msg}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main login form (unauthenticated state)
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
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-100 text-gray-900 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </div>
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

        {/* Debug info - collapsible */}
        {debugLog.length > 0 && (
          <details className="mt-6 w-full max-w-sm">
            <summary className="text-gray-600 text-xs cursor-pointer">Show debug log</summary>
            <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              {debugLog.map((msg, i) => (
                <p key={i} className="text-gray-500 text-xs font-mono">{msg}</p>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
