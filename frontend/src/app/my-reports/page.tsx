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
    <div className="min-h-screen bg-transparent">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Reports</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map((report, index) => {
              const isResolved = report.status === 'RESOLVED';
              const reportedDate = new Date(report.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Title */}
                  <h3 className="text-[17px] font-bold text-slate-900 mb-4">{report.title}</h3>

                  {/* Image */}
                  <div className="mb-4">
                    {report.hasImage ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={reportApi.getImageUrl(report.id)}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <span className="text-3xl opacity-50">📷</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-slate-600">
                      Reported: {reportedDate}
                    </p>
                    <p className="text-sm text-slate-600">
                      Location: {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="mb-8">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        isResolved
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-emerald-300/40 text-emerald-700'
                      }`}
                    >
                      {isResolved ? 'RESOLVED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <Link
                      href={`/report/${report.id}`}
                      className="flex-1 py-2.5 rounded-full border-2 border-indigo-600 text-indigo-700 text-[13px] font-bold text-center hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => !isResolved && handleToggleStatus(report.id, report.status)}
                      disabled={isResolved}
                      className={`flex-1 py-2.5 rounded-full text-[13px] font-bold text-center transition-colors ${
                        isResolved
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Mark Resolved
                    </button>
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
