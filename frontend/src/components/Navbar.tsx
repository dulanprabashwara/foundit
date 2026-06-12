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
} from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/my-reports', label: 'My Reports' },
    { href: '/settings', label: 'Profile' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
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
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
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
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/notifications"
              className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
            </Link>

            <div className="relative ml-2">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm overflow-hidden">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
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
