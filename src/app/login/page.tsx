"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { auth, db, googleProvider } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

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

      router.push("/dashboard");
    } catch (error) {
      console.error("Google Sign-In error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            description = "Sign-in cancelled. Please try again.";
            break;
          case "auth/popup-blocked":
            description = "Pop-up blocked. Please allow pop-ups.";
            break;
          case "auth/cancelled-popup-request":
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-mobile flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 safe-all">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <div className="relative p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo and heading */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Commute Companion
          </h1>
          <p className="text-white/80 text-sm">
            Sign in to start your journey
          </p>
        </div>

        {/* Sign in card */}
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 text-base font-medium bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 shadow-sm rounded-2xl transition-all active:scale-[0.98]"
            variant="outline"
          >
            {isLoading ? (
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

          <div className="my-6 text-center">
            <p className="text-xs text-gray-500">
              Secure authentication powered by Google
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: <Zap className="w-4 h-4" />, text: "Instant sign-in, no passwords" },
              { icon: <Shield className="w-4 h-4" />, text: "Your data is always secure" },
              { icon: <Users className="w-4 h-4" />, text: "Join 500+ students" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  {feature.icon}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-white/60 text-xs mt-8 max-w-xs">
          By signing in, you agree to our{" "}
          <Link href="#" className="underline">Terms</Link> and{" "}
          <Link href="#" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
