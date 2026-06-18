'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ReportCard from '@/components/ReportCard';
import MapView from '@/components/MapView';
import { reportApi } from '@/lib/api';
import { Report, CATEGORIES, Category } from '@/lib/types';
import {
  Search,
  Filter,
  Map,
  LayoutList,
  Loader2,
  MapPin,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'feed'>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetcher for SWR
  const fetcher = async () => {
    return await reportApi.list({
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    });
  };

  const { data: reports = [], error: swrError, isLoading: loading, mutate: refreshReports } = useSWR(
    user ? `/api/reports?category=${selectedCategory}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Revalidate every minute
    }
  );

  const error = swrError?.message || '';

  useEffect(() => {
    const saved = localStorage.getItem('foundit_geofence');
    if (saved) {
      try {
        const geo = JSON.parse(saved);
        setUserLocation({ latitude: geo.latitude, longitude: geo.longitude });
      } catch (e) {}
    } else {
      // Default to Colombo center if no geofence is set yet
      setUserLocation({ latitude: 6.9271, longitude: 79.8612 });
    }
  }, []);

  const filteredReports = (reports as Report[]).filter((report: Report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query)
    );
  });

  // Sort so selected report is at the top, and others are sorted by distance if a report is selected
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (a.id === selectedReportId) return -1;
    if (b.id === selectedReportId) return 1;
    
    if (selectedReportId) {
      const selected = (reports as Report[]).find((r: Report) => r.id === selectedReportId);
      if (selected) {
        // Simple Pythagorean distance for sorting nearby items
        const distA = Math.pow(a.latitude - selected.latitude, 2) + Math.pow(a.longitude - selected.longitude, 2);
        const distB = Math.pow(b.latitude - selected.latitude, 2) + Math.pow(b.longitude - selected.longitude, 2);
        return distA - distB;
      }
    }
    
    if (userLocation) {
      const distA = Math.pow(a.latitude - userLocation.latitude, 2) + Math.pow(a.longitude - userLocation.longitude, 2);
      const distB = Math.pow(b.latitude - userLocation.latitude, 2) + Math.pow(b.longitude - userLocation.longitude, 2);
      
      // Only sort by distance if they are reasonably far apart, otherwise sort by newest
      // 0.0001 in squared degrees is very roughly ~1km depending on latitude
      if (Math.abs(distA - distB) > 0.0001) {
        return distA - distB;
      }
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
          {/* Feed/Map Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            {([
              { mode: 'feed', icon: LayoutList, label: 'Feed' },
              { mode: 'map', icon: Map, label: 'Map' },
            ] as const).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  (viewMode === mode || (viewMode === 'split' && mode === 'feed'))
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Filter className="w-4 h-4 text-slate-500" />
            Filters
          </button>
        </div>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <div className="mb-8 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Category filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Types
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? 'text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                    style={
                      selectedCategory === cat.value
                        ? { backgroundColor: cat.color }
                        : {}
                    }
                  >
                    <img src={cat.icon} alt={cat.label} className="w-5 h-5 object-contain" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => refreshReports()} className="ml-auto font-semibold hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="text-sm text-slate-500">Loading reports...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-slate-200/60 rounded-3xl shadow-xs animate-fade-in relative overflow-hidden max-w-2xl mx-auto">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/3"></div>

            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-full h-full bg-linear-to-br from-white to-primary-50 border border-primary-100 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/10">
                <MapPin className="w-10 h-10 text-primary-500 drop-shadow-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">No reports found</h3>
            <p className="text-base text-slate-500 text-center max-w-md mb-8 relative z-10 leading-relaxed">
              {searchQuery
                ? 'We could not find any reports matching your search. Try different keywords or adjust your filters.'
                : 'Your feed is currently empty. Whether you lost something or found an item, create a report to get started!'}
            </p>
            <button
              onClick={() => setShowReportTypeModal(true)}
              className="relative z-10 flex items-center gap-2.5 px-8 py-3.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-900/20"
            >
              <Plus className="w-4.5 h-4.5" />
              Create a Report
            </button>
          </div>
        ) : (
          <div
            className={`${
              viewMode === 'split'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
                : viewMode === 'map'
                ? ''
                : ''
            }`}
          >
            {/* Feed */}
            {(viewMode === 'split' || viewMode === 'feed') && (
              <div className={`${viewMode === 'split' ? 'order-1 h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar' : 'max-w-4xl mx-auto w-full'}`}>
                <div
                  className={`grid gap-4 ${
                    viewMode === 'feed'
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'
                  }`}
                >
                  {sortedReports.map((report, i) => (
                    <div key={report.id} onClick={() => setSelectedReportId(report.id)} className={`transition-all duration-300 ${report.id === selectedReportId ? 'ring-2 ring-indigo-500 rounded-2xl scale-[1.02]' : 'hover:scale-[1.01]'}`}>
                      <ReportCard report={report} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div
                className={`${
                  viewMode === 'split'
                    ? 'order-2 sticky top-24'
                    : ''
                }`}
              >
                <div className={`rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${
                  viewMode === 'split' ? 'h-[calc(100vh-220px)]' : 'h-[calc(100vh-240px)]'
                }`}>
                  <MapView
                    reports={sortedReports}
                    selectedReportId={selectedReportId}
                    onReportSelect={(id) => {
                      if (viewMode === 'map') {
                        router.push(`/report/${id}`);
                      } else {
                        setSelectedReportId(id);
                      }
                    }}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowReportTypeModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all z-40"
        title="Report an item"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Report Type Modal */}
      {showReportTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up relative">
            <button
              onClick={() => setShowReportTypeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">What are you reporting?</h2>
              <p className="text-sm text-slate-500 mb-8 text-center">Help the community by choosing the right category</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/report/new?type=LOST')}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-8 h-8 text-rose-600" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-rose-700">Lost Item</span>
                </button>
                
                <button
                  onClick={() => router.push('/report/new?type=FOUND')}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Found Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
