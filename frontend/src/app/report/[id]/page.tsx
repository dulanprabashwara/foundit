'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MapView from '@/components/MapView';
import { reportApi, commentApi } from '@/lib/api';
import { Report, Comment, getCategoryInfo } from '@/lib/types';
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Trash2,
  RotateCcw,
  User,
  Share2,
} from 'lucide-react';

export default function ReportDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && reportId) {
      fetchReport();
    }
  }, [user, reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportApi.get(reportId);
      setReport(data);
      setComments(data.comments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const comment = await commentApi.create(reportId, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleToggleStatus = async () => {
    if (!report) return;
    setStatusLoading(true);
    try {
      const newStatus = report.status === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';
      const updated = await reportApi.updateStatus(reportId, newStatus);
      setReport({ ...report, ...updated });
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportApi.delete(reportId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const isOwner = user?.uid === report?.authorId;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Report not found</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const categoryInfo = getCategoryInfo(report.category);
  const isResolved = report.status === 'RESOLVED';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {report.hasImage && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-fade-in">
                <img
                  src={reportApi.getImageUrl(report.id)}
                  alt={report.title}
                  className={`w-full max-h-96 object-cover ${isResolved ? 'grayscale opacity-70' : ''}`}
                />
              </div>
            )}

            {/* Details card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
              {/* Status & Category */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${categoryInfo.color}15`,
                    color: categoryInfo.color,
                  }}
                >
                  <div className="w-4 h-4 mask-icon" style={{ backgroundColor: categoryInfo.color, maskImage: `url(${categoryInfo.icon})`, WebkitMaskImage: `url(${categoryInfo.icon})` }} />
                  {categoryInfo.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    isResolved
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isResolved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Active
                    </>
                  )}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">{report.title}</h1>

              <p className="text-slate-600 leading-relaxed mb-6">{report.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {report.author.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {new Date(report.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </span>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleToggleStatus}
                    disabled={statusLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isResolved
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {statusLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isResolved ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Resolved
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                Comments
                <span className="text-sm font-normal text-slate-400">({comments.length})</span>
              </h2>

              {/* Comment list */}
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 animate-fade-in">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {comment.author.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-700">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {comment.authorId === user?.uid && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {commentLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    Location
                  </h3>
                </div>
                <div style={{ height: '250px' }}>
                  <MapView
                    reports={[report]}
                    center={[report.latitude, report.longitude]}
                    zoom={15}
                    className="w-full h-full"
                    interactive={false}
                  />
                </div>
              </div>

              {/* Quick info card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <div className="w-5 h-5 mask-icon bg-primary-600" style={{ maskImage: `url(${categoryInfo.icon})`, WebkitMaskImage: `url(${categoryInfo.icon})` }} /> {categoryInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`font-medium ${isResolved ? 'text-emerald-600' : 'text-amber-600'}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Posted by</span>
                    <span className="font-medium text-slate-700">{report.author.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Comments</span>
                    <span className="font-medium text-slate-700">{comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
