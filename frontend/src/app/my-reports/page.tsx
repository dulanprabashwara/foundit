'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { reportApi } from '@/lib/api';
import { Report, getCategoryInfo } from '@/lib/types';
import {
  Loader2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  MapPin,
  RotateCcw,
  Trash2,
  Eye,
  Filter,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import MapView from '@/components/MapView';

export default function MyReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user]);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getMyReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (reportId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';
      await reportApi.updateStatus(reportId, newStatus as any);
      setReports(
        reports.map((r) => (r.id === reportId ? { ...r, status: newStatus as any } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportApi.delete(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const filteredReports =
    statusFilter === 'ALL'
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  // Sort so selected report is at the top
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (a.id === selectedReportId) return -1;
    if (b.id === selectedReportId) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = reports.filter((r) => r.status === 'ACTIVE').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your lost and found item reports
            </p>
          </div>
          <Link
            href="/report/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
                <p className="text-xs text-slate-500">Total Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{resolvedCount}</p>
                <p className="text-xs text-slate-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'ACTIVE' ? '🟡 Active' : '✅ Resolved'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 mb-6 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Layout */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {statusFilter === 'ALL'
                ? 'No reports yet'
                : `No ${statusFilter.toLowerCase()} reports`}
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
              {statusFilter === 'ALL'
                ? "You haven't created any reports yet. Start by reporting a lost or found item."
                : `You don't have any ${statusFilter.toLowerCase()} reports.`}
            </p>
            {statusFilter === 'ALL' && (
              <Link
                href="/report/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                Create Report
              </Link>
            )}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 min-h-0">
            {/* List View Sidebar */}
            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {sortedReports.map((report) => {
                const categoryInfo = getCategoryInfo(report.category);
                const isResolved = report.status === 'RESOLVED';
                const timeAgo = new Date(report.createdAt).toLocaleDateString();

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`block relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isResolved
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5'
                    } ${report.id === selectedReportId ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  >
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-[10px] font-bold shadow-sm">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        My Report
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                        isResolved 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isResolved ? 'RESOLVED' : 'ACTIVE'}
                      </div>
                    </div>

                    {/* Image */}
                    {report.hasImage ? (
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={reportApi.getImageUrl(report.id)}
                          alt={report.title}
                          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                            isResolved ? 'grayscale opacity-80' : ''
                          }`}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className={`h-48 flex items-center justify-center bg-indigo-50/50`}>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <span className="text-2xl text-indigo-400 opacity-50">📷</span>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <h3 className={`font-bold text-lg mb-2 line-clamp-1 ${
                        isResolved ? 'text-slate-500' : 'text-slate-800'
                      } transition-colors`}>
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                          <span>{categoryInfo.emoji}</span>
                          {categoryInfo.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo}
                        </span>
                      </div>

                      <div className="h-px w-full bg-slate-100 mb-4" />

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/report/${report.id}`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                          <Eye className="w-3 h-3 ml-1" />
                        </Link>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleStatus(report.id, report.status)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isResolved
                                ? 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {isResolved ? <RotateCcw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isResolved ? 'Reopen' : 'Resolve'}
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-1.5 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map View */}
            <div className="hidden lg:block h-full min-h-[400px]">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-full w-full">
                <MapView
                  reports={sortedReports}
                  selectedReportId={selectedReportId}
                  onReportSelect={(id) => setSelectedReportId(id)}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
