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

export default function MyReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
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

        {/* Reports list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-primary-300" />
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
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
              >
                <Plus className="w-4 h-4" />
                Create Report
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report, index) => {
              const categoryInfo = getCategoryInfo(report.category);
              const isResolved = report.status === 'RESOLVED';

              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all animate-fade-in-up ${
                    isResolved ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {report.hasImage ? (
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={reportApi.getImageUrl(report.id)}
                          alt={report.title}
                          className={`w-full h-full object-cover ${isResolved ? 'grayscale' : ''}`}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${categoryInfo.color}15` }}
                      >
                        <span className="text-2xl">{categoryInfo.emoji}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${categoryInfo.color}15`,
                            color: categoryInfo.color,
                          }}
                        >
                          {categoryInfo.emoji} {categoryInfo.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isResolved ? '✅ Resolved' : '🟡 Active'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{report.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{report.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {report._count?.comments || 0} comments
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      <Link
                        href={`/report/${report.id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(report.id, report.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          isResolved
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={isResolved ? 'Reopen' : 'Mark Resolved'}
                      >
                        {isResolved ? <RotateCcw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
