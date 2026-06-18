import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Target, Globe, Zap } from 'lucide-react';

export default function MissionPage() {
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
              <Target className="w-4 h-4" />
              Our Mission
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              A world where nothing stays lost forever.
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              We are on a mission to build a global, decentralized network of good Samaritans equipped with the best tools to easily return lost items to their rightful owners.
            </p>
          </section>

          <div className="relative w-full h-64 md:h-96 rounded-4xl overflow-hidden shadow-2xl mt-8">
            <img 
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop" 
              alt="Community working together" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent flex items-end p-8">
              <h2 className="text-white text-2xl md:text-3xl font-bold max-w-lg">Building trust and empathy in communities worldwide.</h2>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
             <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Global Reach, Local Impact</h3>
              <p className="text-slate-500 leading-relaxed">
                While our platform spans across cities worldwide, its true power lies in local neighborhoods. We aim to connect neighbors and locals to quickly resolve lost-and-found cases right where they happen.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Frictionless Experience</h3>
              <p className="text-slate-500 leading-relaxed">
                Every second counts when something is lost. Our mission is to continuously innovate our matching algorithms and notification systems to make reporting and claiming items instantaneous and stress-free.
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
