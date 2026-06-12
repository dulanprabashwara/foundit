'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsDropdown, setNotificationsDropdown] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/my-reports', label: 'My Reports' },
    { href: '/settings', label: 'Profile' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/60">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              FoundIt
            </span>
          </Link>

          {/* Desktop Navigation (Centered) */}
          <div className="hidden md:flex items-center gap-14 absolute left-1/2 -translate-x-1/2 h-full">
            {navLinks.map((link) => {
              const active = isActive(link.href) || (link.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center h-full text-sm font-medium transition-colors ${
                    active ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {active && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">
            <div className="relative">
              <button
                onClick={() => setNotificationsDropdown(!notificationsDropdown)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {notificationsDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                      <span className="text-xs font-medium text-primary-600 cursor-pointer hover:text-primary-700">Mark all as read</span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {/* Notification 1: Comment */}
                      <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800"><span className="font-semibold">Alex M.</span> commented on your report <span className="font-semibold">"Lost Keys"</span></p>
                          <p className="text-xs text-slate-500 mt-1">"Hey, I think I found these near the park entrance..."</p>
                          <p className="text-[10px] text-slate-400 mt-1">10 minutes ago</p>
                        </div>
                      </div>

                      {/* Notification 2: Nearby Item */}
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800"><span className="font-semibold">New Lost Item</span> reported in your area!</p>
                          <p className="text-xs text-slate-500 mt-1">A "Golden Retriever" was reported lost 1.2km away from your home location.</p>
                          <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link href="/settings" onClick={() => setNotificationsDropdown(false)} className="block px-4 py-2.5 text-center text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 transition-colors border-t border-slate-100">
                      View Notification Settings
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-primary-500/50 transition-all">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
              </button>

              {profileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href) || (link.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
