"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
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
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  Quote,
  ChevronRight,
  Bus,
  Navigation,
  Leaf
} from 'lucide-react';

// Animated counter component with intersection observer
const AnimatedCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [count, setCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  return <div ref={ref}>{count}{suffix}</div>;
};

// Mobile-optimized Feature Card
const FeatureCard = ({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient: string }) => (
  <div className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md active:scale-[0.98] transition-transform duration-150 border border-gray-100 dark:border-gray-700">
    <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
  </div>
);

// Mobile-optimized Testimonial Card
const TestimonialCard = ({ name, role, content, avatar, rating }: { name: string, role: string, content: string, avatar: string, rating: number }) => (
  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg min-w-[280px] snap-center">
    <CardContent className="p-5">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">&ldquo;{content}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white text-sm">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Step component for How It Works
const StepCard = ({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) => (
  <div className="flex gap-4 items-start">
    <div className="relative flex-shrink-0">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs shadow-md">
        {number}
      </div>
    </div>
    <div className="pt-1">
      <h3 className="text-base font-bold mb-1 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  </div>
);

// Stat item for mobile
const StatItem = ({ value, suffix, label, icon }: { value: number, suffix?: string, label: string, icon: React.ReactNode }) => (
  <div className="text-center p-4">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">
      <AnimatedCounter value={value} suffix={suffix} />
    </div>
    <div className="text-white/70 text-xs">{label}</div>
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

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen-mobile bg-white dark:bg-gray-900">
      {/* Header - Mobile Optimized */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 safe-top ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-3'
        }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className={`text-lg font-bold transition-colors ${scrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`}>
              Commute
            </span>
          </Link>

          {/* Desktop nav - hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-6">
            {['Home', 'About', 'Features', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className={`rounded-full px-5 text-sm font-medium ${scrolled
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white text-indigo-600'
                }`}
            >
              <Link href="/login">Get App</Link>
            </Button>
            <button
              className={`lg:hidden p-2 rounded-lg transition-colors touch-target ${scrolled ? 'text-gray-800' : 'text-white'}`}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 animate-fade-in safe-all">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <Logo showText />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg touch-target"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              {['Home', 'About', 'Features', 'How it Works', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-semibold text-gray-800 dark:text-white active:text-indigo-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="p-6 safe-bottom">
              <Button asChild className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-semibold">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section - Mobile First */}
        <section id="home" className="relative min-h-screen-mobile flex items-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />

          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 py-12 safe-x">
            <div className="max-w-lg mx-auto text-center lg:text-left lg:max-w-none lg:mx-0 lg:flex lg:items-center lg:gap-16">
              <div className="lg:w-1/2">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs mb-6">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-Powered Campus Transport</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
                  Your Smart
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Commute Companion
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-base sm:text-lg text-white/90 mb-8 max-w-md mx-auto lg:mx-0">
                  Share rides, split fares, and travel smart with AI-powered predictions.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                  <Button size="lg" className="h-14 bg-white text-indigo-600 hover:bg-gray-100 rounded-2xl text-base font-semibold shadow-xl" asChild>
                    <Link href="/login" className="flex items-center justify-center gap-2">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 border-2 border-white/40 text-white hover:bg-white/20 rounded-2xl text-base backdrop-blur-sm" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>

                {/* Trust badges - horizontal scroll on mobile */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>100% Free</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Verified Users</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Instant Matching</span>
                  </div>
                </div>
              </div>

              {/* Phone mockup - hidden on small mobile, shown on larger screens */}
              <div className="hidden sm:block lg:w-1/2 mt-12 lg:mt-0">
                <div className="relative max-w-xs mx-auto">
                  <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                      <div className="h-6 flex items-center justify-center">
                        <div className="w-16 h-4 bg-black rounded-full" />
                      </div>
                      <div className="h-[320px] bg-gradient-to-b from-indigo-500/30 to-purple-500/20 p-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-white text-xs">Your Location</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-red-400" />
                            <span className="text-white text-xs">Sharda University</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { route: "Bus 73A", time: "2 min", color: "bg-green-400" },
                            { route: "Cab Pool", time: "5 min", color: "bg-yellow-400" },
                            { route: "Bus 100B", time: "8 min", color: "bg-green-400" },
                          ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Bus className="w-4 h-4 text-white" />
                                <span className="text-white text-xs font-medium">{item.route}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white/70 text-xs">{item.time}</span>
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Compact for Mobile */}
        <section className="relative -mt-6 z-10 px-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl mx-auto max-w-lg lg:max-w-4xl overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-white/20">
              <StatItem value={500} suffix="+" label="Students" icon={<Users className="w-5 h-5 text-white/70" />} />
              <StatItem value={1200} suffix="+" label="Rides" icon={<Bus className="w-5 h-5 text-white/70" />} />
              <StatItem value={50} suffix="K" label="Saved" icon={<IndianRupee className="w-5 h-5 text-white/70" />} />
              <StatItem value={24} suffix="/7" label="Live" icon={<Clock className="w-5 h-5 text-white/70" />} />
            </div>
          </div>
        </section>

        {/* About Section - Mobile Optimized */}
        <section id="about" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto lg:max-w-none lg:flex lg:items-center lg:gap-16">
              {/* Image - shown on larger screens */}
              <div className="hidden lg:block lg:w-1/2">
                <div className="relative">
                  <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-2" />
                  <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                      alt="Bus transportation"
                      width={500}
                      height={350}
                      className="rounded-2xl w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs mb-4">
                  <Zap className="w-3 h-3" />
                  <span>About Us</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
                  Smart, Social &
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Eco-Friendly</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
                  Commute Companion connects students heading the same way. Share rides, split costs, reduce emissions, and make new friends along the way.
                </p>

                <div className="space-y-4 mb-6">
                  {[
                    { icon: <MapPin className="w-4 h-4 text-white" />, title: "Live Tracking", desc: "Real-time bus & cab tracking" },
                    { icon: <Bot className="w-4 h-4 text-white" />, title: "AI Predictions", desc: "Avoid crowded buses" },
                    { icon: <Star className="w-4 h-4 text-white" />, title: "Earn Rewards", desc: "Points for every ride" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full sm:w-auto h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-6">
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    Join Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Mobile Grid */}
        <section id="features" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs mb-4">
                <Star className="w-3 h-3" />
                <span>Features</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                Everything You Need
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                Smart features for smarter commuting
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                icon={<Users className="w-6 h-6 text-white" />}
                title="Ride Matching"
                description="Instant co-traveller matching"
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <FeatureCard
                icon={<CalendarClock className="w-6 h-6 text-white" />}
                title="Schedule"
                description="Plan rides in advance"
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
              <FeatureCard
                icon={<IndianRupee className="w-6 h-6 text-white" />}
                title="Split Fare"
                description="Share and save money"
                gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-white" />}
                title="Safe Travel"
                description="Verified users only"
                gradient="bg-gradient-to-br from-rose-500 to-orange-500"
              />
              <FeatureCard
                icon={<Bot className="w-6 h-6 text-white" />}
                title="AI Powered"
                description="Smart route suggestions"
                gradient="bg-gradient-to-br from-violet-500 to-purple-500"
              />
              <FeatureCard
                icon={<MapPin className="w-6 h-6 text-white" />}
                title="Live Map"
                description="Real-time GPS tracking"
                gradient="bg-gradient-to-br from-indigo-500 to-blue-500"
              />
              <FeatureCard
                icon={<Leaf className="w-6 h-6 text-white" />}
                title="Eco-Friendly"
                description="Reduce carbon footprint"
                gradient="bg-gradient-to-br from-teal-500 to-green-500"
              />
              <FeatureCard
                icon={<Star className="w-6 h-6 text-white" />}
                title="Rewards"
                description="Earn points every ride"
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
              />
            </div>
          </div>
        </section>

        {/* How It Works - Mobile Steps */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs mb-4">
                <Zap className="w-3 h-3" />
                <span>How It Works</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                Get Started in Minutes
              </h2>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <StepCard
                number="1"
                title="Sign Up Instantly"
                description="Quick sign-in with Google. No forms needed."
                icon={<Users className="w-7 h-7 text-white" />}
              />
              <StepCard
                number="2"
                title="Find Your Ride"
                description="Browse rides or track buses live on the map."
                icon={<MapPin className="w-7 h-7 text-white" />}
              />
              <StepCard
                number="3"
                title="Connect & Go"
                description="Join a carpool or select a bus and start moving."
                icon={<Zap className="w-7 h-7 text-white" />}
              />
              <StepCard
                number="4"
                title="Earn Rewards"
                description="Complete rides and redeem points for vouchers."
                icon={<Star className="w-7 h-7 text-white" />}
              />
            </div>

            <div className="text-center mt-10">
              <Button asChild className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-8 text-base font-semibold">
                <Link href="/login" className="flex items-center gap-2">
                  Start Your Journey <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials - Horizontal Scroll */}
        <section className="py-16 lg:py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs mb-4">
                <Quote className="w-3 h-3" />
                <span>Testimonials</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Loved by Students
              </h2>
            </div>

            {/* Horizontal scroll container */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              <TestimonialCard
                name="Priya Sharma"
                role="B.Tech, 3rd Year"
                content="I save over ₹2000 every month by sharing rides. The crowd prediction is super helpful!"
                avatar="PS"
                rating={5}
              />
              <TestimonialCard
                name="Rahul Verma"
                role="MBA, 1st Year"
                content="The female-only ride option makes me feel safe. Already redeemed 3 vouchers!"
                avatar="RV"
                rating={5}
              />
              <TestimonialCard
                name="Ankit Kumar"
                role="B.Com, 2nd Year"
                content="As a driver, posting rides is super easy. The community is friendly and respectful."
                avatar="AK"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-white/90 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Join 500+ students already using Commute Companion
            </p>
            <Button asChild className="h-14 bg-white text-indigo-600 hover:bg-gray-100 rounded-2xl px-8 text-base font-semibold shadow-xl">
              <Link href="/login" className="flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer - Mobile Optimized */}
      <footer id="contact" className="bg-gray-900 text-white pt-12 pb-8 safe-bottom">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 lg:col-span-1">
              <Logo size="md" />
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                Smart ride-pooling for students. Affordable, social, and eco-friendly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Contact</h3>
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>Sharda University</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>+91 12345 67890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>hello@commute.app</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Links</h3>
              <ul className="space-y-2 text-xs">
                {['Home', 'About', 'Features', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-indigo-400 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-xs">
            <p>© {new Date().getFullYear()} Commute Companion. Made with ❤️ at Sharda University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}