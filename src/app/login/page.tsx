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
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Users, Sparkles } from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================
const REDIRECT_CHECK_TIMEOUT = 5000;

const navigateToDashboard = (): void => {
  window.location.href = "/dashboard";
};

type AuthState =
  | { status: "initializing" }
  | { status: "checking_redirect" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "signing_in" }
  | { status: "error"; message: string };

export default function LoginPage() {
  const { toast } = useToast();
  const [authState, setAuthState] = React.useState<AuthState>({ status: "initializing" });
  const [debugLog, setDebugLog] = React.useState<string[]>([]);
  const hasNavigatedRef = React.useRef(false);
  const isInitializedRef = React.useRef(false);

  const log = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[Auth ${timestamp}] ${message}`);
    setDebugLog(prev => [...prev.slice(-14), `${timestamp}: ${message}`]);
  }, []);

  const processAuthenticatedUser = React.useCallback(async (user: User, showToast: boolean = false) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    setAuthState({ status: "authenticated", user });

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          points: 0,
          profileComplete: true,
          createdAt: new Date().toISOString(),
        });
        toast({ title: "Welcome! 🎉", description: "Your account has been created." });
      } else if (showToast) {
        toast({ title: "Welcome back! 👋", description: "Signed in successfully." });
      }
      setTimeout(() => navigateToDashboard(), 500);
    } catch (error) {
      console.error("Error processing user:", error);
      hasNavigatedRef.current = false;
      setAuthState({ status: "error", message: "Failed to set up account." });
    }
  }, [toast]);

  React.useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    let isMounted = true;

    const checkRedirectOnly = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthCallback = window.location.href.includes('__/auth/') ||
        urlParams.has('mode') ||
        document.referrer.includes('accounts.google.com');

      if (hasAuthCallback) {
        setAuthState({ status: "checking_redirect" });
        try {
          const result = await Promise.race([
            getRedirectResult(auth),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), REDIRECT_CHECK_TIMEOUT))
          ]);
          if (result?.user && isMounted) {
            await processAuthenticatedUser(result.user, true);
            return;
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (isMounted) setAuthState({ status: "unauthenticated" });
    };

    checkRedirectOnly();
    return () => { isMounted = false; };
  }, [processAuthenticatedUser]);

  const handleGoogleSignIn = async () => {
    setAuthState({ status: "signing_in" });
    try {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          await processAuthenticatedUser(result.user, true);
          return;
        }
      } catch (popupError) {
        if (popupError instanceof FirebaseError && ["auth/popup-blocked", "auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(popupError.code)) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Sign In Failed", description: "Please try again." });
      setAuthState({ status: "unauthenticated" });
    }
  };

  const logoGradient = "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

  if (authState.status === "initializing" || authState.status === "checking_redirect" || authState.status === "authenticated" || authState.status === "signing_in") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-6">
          <Logo size="lg" />
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Authenticating</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 safe-all font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </Link>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-8 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2.5rem] mb-8 border border-indigo-100 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <div className="w-full max-w-sm">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-16 text-lg font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-[1.25rem] transition-all active:scale-[0.98] shadow-xl"
          >
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </div>
          </Button>

          <div className="my-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-950 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Check</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, text: "Instant Set-up", color: "text-indigo-600 dark:text-indigo-400" },
              { icon: Shield, text: "Data Privacy", color: "text-purple-600 dark:text-purple-400" },
              { icon: Users, text: "500+ Peers", color: "text-pink-600 dark:text-pink-400" },
              { icon: Sparkles, text: "Earn Vouchers", color: "text-amber-500 dark:text-amber-400" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold mt-12 max-w-xs uppercase tracking-widest leading-loose">
          By signing in, you agree to our<br />
          <Link href="#" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-indigo-600 hover:underline">Privacy</Link>
        </p>
      </div>
    </div>
  );
}
