'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MapView from '@/components/MapView';
import { reportApi, notificationApi } from '@/lib/api';
import { Report, getCategoryInfo } from '@/lib/types';
import { 
  Loader2, 
  User,
  Bell,
  MapPin,
  Settings as SettingsIcon,
  Crosshair,
  Radius,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Info 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('123-456-7789');
  const [savingProfile, setSavingProfile] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  // Notification Settings state
  const [latitude, setLatitude] = useState<number>(6.9271);
  const [longitude, setLongitude] = useState<number>(79.8612);
  const [radius, setRadius] = useState<number>(5);
  const [checking, setChecking] = useState(false);
  const [nearbyReportsNotification, setNearbyReportsNotification] = useState<Report[]>([]);
  const [nearbyCount, setNearbyCount] = useState<number | null>(null);
  const [notificationError, setNotificationError] = useState('');
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      setFullName(user.displayName || 'Jane Doe');
      setEmail(user.email || 'av.janedoe@gmail.com');
      
      reportApi.getMyReports().then(data => {
        setRecentReports(data.slice(0, 2));
      }).catch(err => console.error(err));
    }
  }, [user, authLoading, router]);

  // Load saved geofence settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('foundit_geofence');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLatitude(settings.latitude || 6.9271);
      setLongitude(settings.longitude || 79.8612);
      setRadius(settings.radius || 5);
    }
  }, []);

  const handleSaveChanges = () => {
    setSavingProfile(true);
    
    // Save geofence settings
    localStorage.setItem(
      'foundit_geofence',
      JSON.stringify({ latitude, longitude, radius })
    );

    setTimeout(() => {
      setSavingProfile(false);
      alert('Profile and Notification Settings updated successfully!');
    }, 1000);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setNotificationError('Geolocation is not supported by your browser');
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGeolocating(false);
      },
      (err) => {
        setNotificationError('Failed to get your location. Please set it manually.');
        setGeolocating(false);
      },
      { enableHighAccuracy: true }
    );
  };



  const handleMapClick = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  const handleCheckNearby = async () => {
    setChecking(true);
    setNotificationError('');
    try {
      const result = await notificationApi.check(latitude, longitude, radius);
      setNearbyReportsNotification(result.reports);
      setNearbyCount(result.count);
    } catch (err: any) {
      setNotificationError(err.message || 'Failed to check nearby reports');
    } finally {
      setChecking(false);
    }
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

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
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


        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings panel */}
          <div className="space-y-6">
            {/* Info card */}
            <div className="bg-primary-50 rounded-2xl border border-primary-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-800 mb-1">How it works</p>
                  <p className="text-xs text-primary-600 leading-relaxed">
                    Set a home area and radius to get notified when new items are reported
                    within your zone. Click on the map or use your current location.
                  </p>
                </div>
              </div>
            </div>

            {/* Location settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-primary-500" />
                Center Point
              </h2>

              <button
                onClick={handleUseMyLocation}
                disabled={geolocating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors mb-4"
              >
                {geolocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Use My Current Location
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    step="0.0001"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    step="0.0001"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Or click on the map to set your center point
              </p>
            </div>

            {/* Radius slider */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Radius className="w-5 h-5 text-primary-500" />
                Alert Radius
              </h2>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Distance</span>
                  <span className="text-lg font-bold text-primary-700">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 km</span>
                  <span>5 km</span>
                  <span>10 km</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCheckNearby}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Check Nearby
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {notificationError && (
              <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {notificationError}
              </div>
            )}

            {/* Nearby results */}
            {nearbyCount !== null && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Nearby Reports
                  <span className="ml-auto bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {nearbyCount}
                  </span>
                </h3>

                {nearbyReportsNotification.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      No active reports within {radius}km of your location
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {nearbyReportsNotification.map((report: any) => {
                      const catInfo = getCategoryInfo(report.category);
                      return (
                        <div
                          key={report.id}
                          onClick={() => router.push(`/report/${report.id}`)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-xl">{catInfo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {report.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {report.distance}km away • {catInfo.label}
                            </p>
                          </div>
                          <MapPin className="w-4 h-4 text-slate-300" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map panel */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Click to set center point
                </h3>
              </div>
              <div style={{ height: '500px' }}>
                <MapView
                  reports={nearbyReportsNotification}
                  center={[latitude, longitude]}
                  zoom={13}
                  onMapClick={handleMapClick}
                  selectedPosition={[latitude, longitude]}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={savingProfile}
            className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[140px]"
          >
            {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
