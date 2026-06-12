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
  Info,
  Edit2,
  Clock,
  Camera
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 pb-16">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between mb-6 gap-6 md:gap-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 p-1 ring-4 ring-white shadow-md relative">
              <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mt-1">
              <h1 className="text-3xl font-bold text-slate-900">{fullName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 mt-2 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Seattle, WA</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                  Verified User
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  Member since 2023
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm whitespace-nowrap">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-8">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Notification Settings Wrapper */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 px-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notification Settings
          </h2>
          
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
                          <img src={catInfo.icon} alt={catInfo.label} className="w-6 h-6 object-contain" />
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

        {/* Recent Activity Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12 mt-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Clock className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              View All
            </button>
          </div>
          
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-2">
            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center border-4 border-white shadow-sm">
                <AlertCircle className="w-3 h-3 text-rose-500" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold text-slate-900">Reported "Lost Keys"</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Northgate Mall area • 1 hr ago</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center border-4 border-white shadow-sm">
                <MapPin className="w-3 h-3 text-teal-600" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold text-slate-900">Found "Golden Retriever"</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Green Lake Park • 4 hrs ago</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm">
                <Camera className="w-3 h-3 text-slate-500" strokeWidth={3} />
              </div>
              <p className="text-sm font-bold text-slate-900">Updated profile photo</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">17 hours ago</p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveChanges}
            disabled={savingProfile}
            className="w-full max-w-sm py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/30 disabled:opacity-70"
          >
            {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save All Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
