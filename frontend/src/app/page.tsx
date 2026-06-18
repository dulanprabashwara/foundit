'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MapPin, Mail, Lock, User, Eye, EyeOff, ArrowRight, Search, Info, Compass, CheckCircle2, Shield, Users, RefreshCw, Share, Key } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '') || 'Google sign-in failed');
    }
  };

  const openAuth = (login: boolean) => {
    setIsLogin(login);
    setShowAuthModal(true);
  };

  if (authLoading) return null;

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      {/* Top NavBar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 w-full z-40 flex justify-center px-4 md:px-10 h-16 md:h-20">
        <div className="w-full max-w-7xl flex items-center justify-between mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <MapPin className="text-primary-600 w-8 h-8" />
            <span className="text-2xl font-bold text-primary-600">FoundIt</span>
          </div>
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-slate-500 font-medium hover:text-primary-600 transition-colors" href="#how-it-works">How It Works</a>
            <button onClick={() => openAuth(true)} className="text-slate-500 font-medium hover:text-primary-600 transition-colors">Post an Item</button>
            <button onClick={() => openAuth(true)} className="text-slate-500 font-medium hover:text-primary-600 transition-colors">Search Items</button>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => openAuth(true)}
              className="hidden md:flex items-center justify-center bg-primary-600 text-white font-medium px-6 py-2 rounded-full hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-24 md:pb-32 flex flex-col items-center w-full">
        <div className="w-full max-w-7xl px-4 md:px-10 space-y-24">
          
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row items-center gap-12 pt-8 md:pt-16">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-primary-600 font-semibold text-xs tracking-wider uppercase">
                <Info className="w-4 h-4" />
                Lost & Found Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Lost something? <br className="hidden md:block" />Start your search now.
              </h1>
              <p className="text-lg text-slate-500">
                Found something? Help return it to its owner. We connect people to recover what matters most across cities worldwide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                <button 
                  onClick={() => openAuth(false)}
                  className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openAuth(true)}
                  className="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-full font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Browse Items
                </button>
              </div>
            </div>

            <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[400px]">
              {/* Main Image */}
              <div className="absolute inset-0 bg-slate-200 rounded-[3rem] shadow-xl overflow-hidden border-8 border-white">
                <img 
                  alt="City background" 
                  className="w-full h-full object-cover opacity-90 mix-blend-multiply" 
                  src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop"
                />
              </div>
              {/* Decorative Floating Circles */}
              <div className="absolute top-4 -left-4 w-24 h-24 rounded-full bg-emerald-100 shadow-md border-4 border-white overflow-hidden">
                <img alt="Lost pet" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop"/>
              </div>
              <div className="absolute bottom-12 -right-6 w-32 h-32 rounded-full bg-amber-100 shadow-md border-4 border-white overflow-hidden">
                <img alt="Lost backpack" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop"/>
              </div>
              <div className="absolute -top-8 right-12 w-20 h-20 rounded-full bg-white shadow-md border-4 border-white overflow-hidden flex items-center justify-center">
                <Key className="text-primary-600 w-8 h-8" />
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section id="how-it-works" className="space-y-12 text-center pt-12">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-primary-600 tracking-widest uppercase">Simple Process</h2>
              <h3 className="text-3xl font-bold text-slate-900">How It Works</h3>
              <p className="text-lg text-slate-500 max-w-lg mx-auto">Three simple steps to recover your lost items or return found ones.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="h-48 bg-slate-100 w-full relative">
                  <img alt="Report" className="w-full h-full object-cover opacity-80" src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop"/>
                </div>
                <div className="p-6 text-left space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Step 1: Report</h4>
                    <p className="text-sm text-slate-500 mt-2">Log where and when you lost or found the item.</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="h-48 bg-slate-100 w-full relative">
                  <img alt="Search" className="w-full h-full object-cover opacity-80" src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=600&auto=format&fit=crop"/>
                </div>
                <div className="p-6 text-left space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Step 2: Search</h4>
                    <p className="text-sm text-slate-500 mt-2">Browse the database for matching found items near you.</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="h-48 bg-slate-100 w-full relative">
                  <img alt="Recover" className="w-full h-full object-cover opacity-80" src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop"/>
                </div>
                <div className="p-6 text-left space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Step 3: Recover</h4>
                    <p className="text-sm text-slate-500 mt-2">Connect safely and get your belongings back.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Community Section */}
          <section id="community" className="flex flex-col md:flex-row items-center gap-12 pt-12">
            <div className="flex-1 w-full">
              <img alt="Community" className="w-full h-full object-cover rounded-[2rem] shadow-xl" src="https://images.unsplash.com/photo-1529156069898-49953eb1f5bc?q=80&w=800&auto=format&fit=crop"/>
            </div>
            <div className="flex-1 space-y-6">
              <div className="text-sm font-bold text-emerald-600 tracking-widest uppercase">Trust & Community</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Powered by the <span className="text-emerald-600">Community</span>
              </h2>
              <p className="text-lg text-slate-500">
                Using our platform, neighbors and good samaritans work together to return lost items with speed, accuracy, and trust.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium text-slate-900">Verified users and secure communication</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium text-slate-900">Connect directly with helpful neighbors</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium text-slate-900">Real-time updates and notifications</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="w-full bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2rem] p-8 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="relative z-10 space-y-6 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                <Users className="w-4 h-4" />
                Join thousands recovering their items
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to find what you lost?
              </h2>
              <p className="text-lg text-primary-100">
                Our community is here to help. Start your search or report a found item today.
              </p>
              <button 
                onClick={() => openAuth(false)}
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-md mt-4"
              >
                Get Started Now
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 md:px-10 mt-auto">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary-400 w-8 h-8" />
              <span className="text-2xl font-bold text-white">FoundIt</span>
            </div>
            <p className="text-sm text-slate-400">
              A community-powered platform connecting people with their lost belongings across cities worldwide.
            </p>
          </div>
          {/* Links Column 1 */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a className="hover:text-white transition-colors" href="#">How It Works</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Post an Item</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Search Items</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Safety Guidelines</a></li>
            </ul>
          </div>
          {/* Links Column 2 */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Our Mission</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          {/* Social/More */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Connect</h4>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" href="#">
                <Share className="w-4 h-4" />
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" href="#">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© 2024 FoundIt. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Search className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isLogin
                    ? 'Sign in to access your dashboard'
                    : 'Join the community to start reporting items'}
                </p>
              </div>

              {/* Google sign in */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 mb-6 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 uppercase tracking-wider">or</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
