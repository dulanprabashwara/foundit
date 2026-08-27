'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LocationName from '@/components/LocationName';
import { reportApi } from '@/lib/api';
import { Report } from '@/lib/types';
import {
  Loader2,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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

  const fetchMyReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportApi.getMyReports();
      setReports(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch reports'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const timeout = window.setTimeout(() => void fetchMyReports(), 0);
    return () => window.clearTimeout(timeout);
  }, [fetchMyReports, user]);

  const handleToggleStatus = async (reportId: string, currentStatus: string) => {
    try {
      const newStatus: Report['status'] = currentStatus === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';
      await reportApi.updateStatus(reportId, newStatus);
      setReports(
        reports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportApi.delete(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete report'));
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

      <main className="page-shell max-w-5xl py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            <span className="eyebrow"><MapPin className="h-3.5 w-3.5" /> Your contribution</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">My reports</h1>
            <p className="text-sm text-slate-500 mt-2">
              Track progress, update details, and close the loop when an item gets home.
            </p>
          </div>
          <Link
            href="/report/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-950 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-950/15"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="app-surface rounded-2xl p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{activeCount}</p></div>
          <div className="app-surface rounded-2xl p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{resolvedCount}</p></div>
        </div>

        {/* Filter tabs */}
        <div className="app-surface flex items-center gap-2 mb-6 rounded-2xl p-2 w-fit">
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {status === 'ALL' ? (
                  'All'
                ) : status === 'ACTIVE' ? (
                  <>
                    <img src="/active.png" alt="Active" className="w-3.5 h-3.5 object-contain" />
                    Active
                  </>
                ) : (
                  <>
                    <img src="/resolved.png" alt="Resolved" className="w-3.5 h-3.5 object-contain" />
                    Resolved
                  </>
                )}
              </span>
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
                    <p className="text-sm text-slate-600 truncate">
                      Location: <LocationName latitude={report.latitude} longitude={report.longitude} />
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="mb-8">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isResolved
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-emerald-300/40 text-emerald-700'
                      }`}
                    >
                      <img 
                        src={isResolved ? '/resolved.png' : '/active.png'} 
                        alt={isResolved ? 'Resolved' : 'Active'} 
                        className="w-4 h-4 object-contain" 
                      />
                      {isResolved ? 'RESOLVED' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <Link
                      href={`/report/${report.id}`}
                      className="flex-1 py-2.5 rounded-full border-2 border-indigo-600 text-indigo-700 text-[13px] font-bold text-center hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(report.id, report.status)}
                      className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-full text-[13px] font-bold text-center transition-colors ${isResolved ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {isResolved ? <><RotateCcw className="h-3.5 w-3.5" /> Reopen</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Resolve</>}
                    </button>
                    <button onClick={() => handleDelete(report.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700" aria-label={`Delete ${report.title}`}><Trash2 className="h-4 w-4" /></button>
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
