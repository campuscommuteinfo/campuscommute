
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Menu, X, Users, CalendarClock, IndianRupee, Verified, Shield, Bot, MapPin, Star, Phone, Mail } from 'lucide-react';

const FeatureCard = ({ icon, title, description, dataAiHint }: { icon: React.ReactNode, title: string, description: string, dataAiHint: string }) => (
  <div className="feature-card bg-white p-6 rounded-xl shadow-md transition duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorksStep = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <div className="flex">
        <div className="flex-shrink-0 mr-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold">{number}</div>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);


export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold text-gray-800">Commute Companion</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-gray-800 hover:text-indigo-600 font-medium">Home</Link>
            <Link href="#about" className="text-gray-800 hover:text-indigo-600 font-medium">About Us</Link>
            <Link href="#features" className="text-gray-800 hover:text-indigo-600 font-medium">Features</Link>
            <Link href="#contact" className="text-gray-800 hover:text-indigo-600 font-medium">Contact Us</Link>
          </nav>
          <div className="hidden md:block">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 py-2 transition duration-300">
              <Link href="/dashboard">Go to App</Link>
            </Button>
          </div>
          <button className="md:hidden text-gray-800 focus:outline-none" onClick={() => setIsMenuOpen(true)}>
            <Menu className="text-2xl" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-gray-800 text-3xl">
                <X />
            </button>
            <div className="flex flex-col items-center space-y-8">
                <Link href="#home" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-indigo-600 text-xl font-medium">Home</Link>
                <Link href="#about" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-indigo-600 text-xl font-medium">About Us</Link>
                <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-indigo-600 text-xl font-medium">Features</Link>
                <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-indigo-600 text-xl font-medium">Contact Us</Link>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition duration-300">
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Go to App</Link>
                </Button>
            </div>
        </div>
      )}

      <main className="flex-1">
        <section id="home" className="text-white py-20" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)'}}>
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Smart Commute Companion</h1>
              <p className="text-xl mb-8">We connect daily commuters to share rides, split fares, and travel affordably with verified co-travellers.</p>
               <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full text-lg animate-pulse" asChild>
                    <Link href="/dashboard">
                        Launch App
                    </Link>
                </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative h-96 w-full">
                <Image src="https://placehold.co/450x800.png" alt="App Screen 1" layout="fill" objectFit="contain" className="w-64 h-auto rounded-xl shadow-2xl z-10 relative" data-ai-hint="app screenshot"/>
                <Image src="https://placehold.co/450x800.png" alt="App Screen 2" layout="fill" objectFit="contain" className="w-64 h-auto rounded-xl shadow-2xl absolute -right-10 top-10 z-0 opacity-90" data-ai-hint="app screenshot"/>
                <Image src="https://placehold.co/450x800.png" alt="App Screen 3" layout="fill" objectFit="contain" className="w-64 h-auto rounded-xl shadow-2xl absolute -left-10 top-20 z-0 opacity-90" data-ai-hint="app screenshot"/>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">About Commute Companion</h2>
              <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <Image src="https://placehold.co/800x800.png" alt="About Commute Companion" width={500} height={500} className="rounded-lg shadow-lg w-full max-w-md mx-auto" data-ai-hint="team collaboration"/>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <p className="text-lg mb-6">Commute Companion is your smart ride-pooling solution — designed to make travel affordable, social, and eco-friendly. We connect riders heading the same way so you can share rides, split costs, and save time. Join the future of urban travel.</p>
                <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition duration-300">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover how we make carpooling smarter, safer, and more affordable</p>
              <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<Users className="w-10 h-10 text-indigo-600"/>} title="Real-Time Ride Matching" description="Find co-travellers instantly going your way — save time, connect fast, and ride smarter." dataAiHint="connection users"/>
                <FeatureCard icon={<CalendarClock className="w-10 h-10 text-indigo-600"/>} title="Scheduled Rides" description="Plan ahead! Create or join trips in advance and find commuters with similar travel plans." dataAiHint="calendar schedule"/>
                <FeatureCard icon={<IndianRupee className="w-10 h-10 text-indigo-600"/>} title="Split Fare — Save Big" description="Why pay alone? Split your cab fare with others — pay only a fraction of the full price." dataAiHint="money saving"/>
                <FeatureCard icon={<Shield className="w-10 h-10 text-indigo-600"/>} title="Female-Only Matching" description="For added comfort and safety, female users can choose to travel only with other verified female users." dataAiHint="safety shield"/>
                <FeatureCard icon={<Bot className="w-10 h-10 text-indigo-600"/>} title="AI-Powered Suggestions" description="Our AI helps you avoid crowded buses during exams and suggests the most convenient meeting spots." dataAiHint="artificial intelligence"/>
                <FeatureCard icon={<MapPin className="w-10 h-10 text-indigo-600"/>} title="Live Bus & Cab Tracking" description="Real-time GPS maps of buses and cabs with crowd status (Green/Yellow/Red)." dataAiHint="map location"/>
                <FeatureCard icon={<Verified className="w-10 h-10 text-indigo-600"/>} title="Verified User System" description="Every user goes through a verification process so you know you're riding with real, safe people." dataAiHint="verified checkmark"/>
                <FeatureCard icon={<Star className="w-10 h-10 text-indigo-600"/>} title="Gamified Rewards" description="Earn points for every ride and redeem them for free ride vouchers, gift cards, and more." dataAiHint="reward prize"/>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                    <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                         <Image src="https://placehold.co/450x800.png" alt="App Screen" width={256} height={512} className="mx-auto" data-ai-hint="app screen"/>
                    </div>
                    <div className="md:w-1/2">
                        <div className="space-y-8">
                            <HowItWorksStep number="1" title="Sign Up & Verify" description="Create your account and complete a quick verification. A trusted community is a safe community."/>
                            <HowItWorksStep number="2" title="Find a Ride or Bus" description="Search for available ride-shares or track your bus in real-time on the live map."/>
                            <HowItWorksStep number="3" title="Connect & Coordinate" description="Join a carpool or select a bus. Get details, see AI predictions, and start your journey."/>
                            <HowItWorksStep number="4" title="Ride Smart & Earn Points" description="Enjoy a smooth commute, split fares in carpools, and earn points for every single ride you take."/>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                     <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg animate-pulse" asChild>
                        <Link href="/dashboard">
                           Launch the App
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
        
        <section className="py-16 bg-indigo-600 text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to Start Saving on Your Commute?</h2>
                 <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full text-lg animate-pulse" asChild>
                    <Link href="/dashboard">
                        Go to App
                    </Link>
                </Button>
            </div>
        </section>
      </main>

      <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Logo/>
                        <span className="text-xl font-bold">Commute Companion</span>
                    </div>
                    <p className="mb-4 text-gray-400">Your smart ride-pooling solution — designed to make travel affordable, social, and eco-friendly.</p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                    <p className="mb-2 text-gray-400 flex items-center gap-2"><MapPin size={16}/> Sharda University, Knowledge Park</p>
                    <p className="mb-2 text-gray-400 flex items-center gap-2"><Phone size={16}/> +91 12345 67890</p>
                    <p className="mb-4 text-gray-400 flex items-center gap-2"><Mail size={16}/> support@commutecompanion.app</p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link href="#home" className="hover:text-indigo-400 text-gray-400">Home</Link></li>
                        <li><Link href="#about" className="hover:text-indigo-400 text-gray-400">About Us</Link></li>
                        <li><Link href="#features" className="hover:text-indigo-400 text-gray-400">Features</Link></li>
                        <li><Link href="#" className="hover:text-indigo-400 text-gray-400">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Download App</h3>
                    <p className="text-gray-400">Coming soon to App Store and Google Play!</p>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Commute Companion. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

    