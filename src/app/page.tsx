"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  Menu,
  X,
  Users,
  CalendarClock,
  IndianRupee,
  Shield,
  Bot,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Bus,
  Navigation,
  Leaf,
  ChevronDown
} from 'lucide-react';

// Feature item for the grid
const FeatureItem = ({
  icon: Icon,
  title,
  description,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) => (
  <div className="flex gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-sm">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{description}</p>
    </div>
  </div>
);

// Stats pill
const StatPill = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center px-4 py-2">
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-[10px] text-white/70 uppercase tracking-wide">{label}</p>
  </div>
);

// Step component
const Step = ({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-emerald-500/30">
      {number}
    </div>
    <div className="pt-1">
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{description}</p>
    </div>
  </div>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 safe-top ${scrolled
          ? 'bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
        }`}>
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-white font-bold text-lg">Commute</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-5 h-9 text-sm font-medium"
            >
              <Link href="/login">Get App</Link>
            </Button>
            <button
              className="text-white p-2"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#0A0A0F] z-50 animate-fade-in safe-all">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-white font-bold">Commute</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              {['Home', 'Features', 'How it Works', 'About'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-medium text-white"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="p-6 safe-bottom">
              <Button asChild className="w-full h-14 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white rounded-2xl text-base font-semibold">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-10">
          {/* Gradient Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-[#0A0A0F] to-[#0A0A0F]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/30 to-cyan-500/30 rounded-full blur-[120px] opacity-50" />
          </div>

          {/* Content */}
          <div className="relative px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-emerald-400 text-xs mb-6 border border-white/10">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered Campus Transport</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-[1.1]">
              Your Smart<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Commute Companion
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
              Share rides, split fares, and travel smart with AI-powered predictions for Knowledge Park students.
            </p>

            {/* CTA Button */}
            <Button
              asChild
              className="h-14 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white hover:opacity-90 rounded-2xl px-8 text-base font-semibold shadow-lg shadow-emerald-500/25"
            >
              <Link href="/login" className="flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-white/60 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Verified Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Instant Match</span>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="mt-12 relative">
              <div className="mx-auto w-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-black/50 border border-white/10">
                <div className="bg-[#0A0A0F] rounded-[2rem] overflow-hidden">
                  {/* Notch */}
                  <div className="h-7 flex items-center justify-center">
                    <div className="w-20 h-5 bg-black rounded-full" />
                  </div>
                  {/* Screen content */}
                  <div className="h-[280px] px-4 pb-4">
                    {/* Search bar */}
                    <div className="bg-white/10 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-white/60 text-xs">Your Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-white/60 text-xs">Sharda University</span>
                      </div>
                    </div>
                    {/* Route cards */}
                    {[
                      { name: "Bus 73A", time: "2 min", crowd: "Low", color: "bg-emerald-400" },
                      { name: "Cab Pool", time: "5 min", crowd: "3 seats", color: "bg-cyan-400" },
                      { name: "Bus 100B", time: "8 min", crowd: "Medium", color: "bg-yellow-400" },
                    ].map((route, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Bus className="w-4 h-4 text-white/70" />
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{route.name}</p>
                            <p className="text-white/50 text-[10px]">{route.crowd}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-xs">{route.time}</span>
                          <div className={`w-2 h-2 rounded-full ${route.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/30 rounded-full blur-[60px]" />
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/40">
              <span className="text-[10px] mb-1">Scroll</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-6 px-6">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl overflow-hidden">
            <div className="flex justify-around py-4">
              <StatPill value="500+" label="Students" />
              <StatPill value="1.2K+" label="Rides" />
              <StatPill value="₹50K+" label="Saved" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-emerald-400 text-xs mb-4">
              <Star className="w-3 h-3" />
              <span>Features</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Smart features designed for your daily commute
            </p>
          </div>

          <div className="space-y-3">
            <FeatureItem
              icon={Users}
              title="Instant Ride Matching"
              description="Find co-travellers heading your way in seconds"
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <FeatureItem
              icon={CalendarClock}
              title="Schedule in Advance"
              description="Plan your rides ahead for stress-free travel"
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <FeatureItem
              icon={IndianRupee}
              title="Split & Save"
              description="Share costs and save up to 70% on travel"
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureItem
              icon={Shield}
              title="Safe & Verified"
              description="All users are verified students with ID"
              color="bg-gradient-to-br from-rose-500 to-orange-600"
            />
            <FeatureItem
              icon={Bot}
              title="AI Predictions"
              description="Know bus crowd levels before you board"
              color="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <FeatureItem
              icon={Leaf}
              title="Eco-Friendly"
              description="Reduce your carbon footprint together"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 px-6 bg-white/[0.02]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-emerald-400 text-xs mb-4">
              <Zap className="w-3 h-3" />
              <span>How It Works</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Start in 3 Steps
            </h2>
          </div>

          <div className="space-y-6">
            <Step number="1" title="Sign Up Instantly" description="Quick Google sign-in, no forms needed" />
            <Step number="2" title="Find Your Ride" description="Browse rides or track buses in real-time" />
            <Step number="3" title="Travel & Earn" description="Complete rides and earn reward points" />
          </div>

          <div className="mt-10 text-center">
            <Button
              asChild
              className="h-14 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white rounded-2xl px-8 text-base font-semibold"
            >
              <Link href="/login" className="flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Save?
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Join 500+ students already using Commute Companion
            </p>
            <Button
              asChild
              className="h-14 bg-white text-gray-900 hover:bg-gray-100 rounded-2xl px-8 text-base font-semibold shadow-lg"
            >
              <Link href="/login" className="flex items-center gap-2">
                Download Free <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 safe-bottom">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-white font-semibold">Commute</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">
          Smart ride-pooling for Knowledge Park students. Affordable, social, and eco-friendly commuting.
        </p>
        <div className="flex gap-4 text-gray-500 text-xs">
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
          <Link href="#" className="hover:text-white">Contact</Link>
        </div>
        <p className="text-gray-600 text-xs mt-6">
          © 2024 Commute Companion. Made with ❤️ at Sharda University
        </p>
      </footer>
    </div>
  );
}