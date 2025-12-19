"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { auth, db, googleProvider } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Users, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    // First, check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        // User is already logged in, redirect to dashboard
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create user document if it doesn't exist
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
          } else {
            toast({
              title: "Welcome back! 👋",
              description: "Signed in successfully.",
            });
          }

          router.replace("/dashboard");
        } catch (error) {
          console.error("Error handling user:", error);
          setCheckingAuth(false);
        }
      } else {
        // No user logged in, check for redirect result
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            // This will trigger onAuthStateChanged again
            return;
          }
        } catch (error) {
          console.error("Redirect result error:", error);
          if (error instanceof FirebaseError) {
            toast({
              variant: "destructive",
              title: "Sign In Failed",
              description: error.message,
            });
          }
        }
        setCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, toast]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Use redirect for all devices - more reliable
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setIsLoading(false);

      let description = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/unauthorized-domain":
            description = "This domain is not authorized. Please add it to Firebase Console.";
            break;
          case "auth/operation-not-allowed":
            description = "Google Sign-In is not enabled. Enable it in Firebase Console.";
            break;
          case "auth/network-request-failed":
            description = "Network error. Please check your connection.";
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
    }
  };

  // Show loading while checking auth state
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Signing you in...</p>
        </div>
      </div>
    );
  }

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
            disabled={isLoading}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-100 text-gray-900 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting...</span>
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
      </div>
    </div>
  );
}
