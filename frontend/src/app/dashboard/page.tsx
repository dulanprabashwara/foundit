'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'feed'>('split');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reportApi.list({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, fetchReports]);

  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query)
    );
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {filteredReports.length} active report{filteredReports.length !== 1 ? 's' : ''} in your area
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {([
                { mode: 'split', icon: SlidersHorizontal, label: 'Split' },
                { mode: 'feed', icon: LayoutList, label: 'Feed' },
                { mode: 'map', icon: Map, label: 'Map' },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={fetchReports}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm"
            />
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
                }`}
                style={
                  selectedCategory === cat.value
                    ? { backgroundColor: cat.color, boxShadow: `0 4px 14px ${cat.color}40` }
                    : {}
                }
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={fetchReports} className="ml-auto font-semibold hover:underline">
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
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No reports found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {searchQuery
                ? 'No reports match your search. Try different keywords.'
                : 'There are no active reports yet. Be the first to report a lost item!'}
            </p>
            <button
              onClick={() => router.push('/report/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
            >
              Report an Item
            </button>
          </div>
        ) : (
          <div
            className={`${
              viewMode === 'split'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : viewMode === 'map'
                ? ''
                : ''
            }`}
          >
            {/* Feed */}
            {(viewMode === 'split' || viewMode === 'feed') && (
              <div className={viewMode === 'split' ? 'order-1' : ''}>
                <div
                  className={`grid gap-4 ${
                    viewMode === 'feed'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  } ${viewMode === 'split' ? 'max-h-[calc(100vh-220px)] overflow-y-auto pr-2' : ''}`}
                >
                  {filteredReports.map((report, i) => (
                    <ReportCard key={report.id} report={report} index={i} />
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
                    reports={filteredReports}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
