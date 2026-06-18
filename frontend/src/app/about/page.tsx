import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Heart, Shield, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="text-primary-600 w-8 h-8" />
              <span className="text-2xl font-bold text-primary-600">FoundIt</span>
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="grow flex flex-col items-center pt-16 pb-24 w-full">
        <div className="w-full max-w-4xl px-6 space-y-16">
          
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-primary-600 font-semibold text-xs tracking-wider uppercase mb-2">
              <Users className="w-4 h-4" />
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Reconnecting people with what matters most.
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              FoundIt was born from a simple idea: what if there was a centralized, community-driven platform to help people find their lost items? We leverage modern technology to make returning lost valuables as easy as ordering a coffee.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Our Story</h3>
              <p className="text-slate-500 leading-relaxed">
                Losing a wallet, a pet, or a cherished heirloom can be a stressful experience. We realized that while social media helps, it is fragmented. FoundIt was created to unify the search, using geolocation and intelligent matching to close the loop between the one who lost and the one who found.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Our Values</h3>
              <p className="text-slate-500 leading-relaxed">
                Trust, community, and security are at the core of everything we do. We verify reports, anonymize location details to prevent misuse, and build features that encourage honest people to do the right thing effortlessly.
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} FoundIt. All rights reserved.</p>
      </footer>
    </div>
  );
}
