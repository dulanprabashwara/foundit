'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, User } from 'lucide-react';
import { reportApi } from '@/lib/api';
import { Report } from '@/lib/types';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('123-456-7789');
  const [saving, setSaving] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      setFullName(user.displayName || 'Jane Doe');
      setEmail(user.email || 'av.janedoe@gmail.com');
      
      // Fetch recent reports for activity list
      reportApi.getMyReports().then(data => {
        setRecentReports(data.slice(0, 2));
      }).catch(err => console.error(err));
    }
  }, [user, authLoading, router]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">User Profile</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-500 mt-1">Seattle, WA</p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 mb-8" />

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
            
            <div className="space-y-5">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 mb-8" />

          {/* Recent Activity */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentReports.length > 0 ? (
                recentReports.map((report, i) => (
                  <p key={report.id} className="text-sm text-slate-700">
                    Reported "{report.title}" • <span className="text-slate-500">{i === 0 ? '1 hr ago' : '5 hrs ago'}</span>
                  </p>
                ))
              ) : (
                <>
                  <p className="text-sm text-slate-700">Reported "Lost Keys" • <span className="text-slate-500">1 hr ago</span></p>
                  <p className="text-sm text-slate-700">Found "Golden Retriever" • <span className="text-slate-500">1 hrs ago</span></p>
                </>
              )}
              <p className="text-sm text-slate-700">Updated profile photo • <span className="text-slate-500">17 hours ago</span></p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[140px]"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
