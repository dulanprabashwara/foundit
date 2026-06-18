'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MapView from '@/components/MapView';
import { reportApi, commentApi, userApi } from '@/lib/api';
import { Report, Comment, getCategoryInfo, CATEGORIES, Category } from '@/lib/types';
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
  Edit2,
  X,
  Save,
  Upload,
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
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<Category | ''>('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState<[number, number] | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading location...');

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

  useEffect(() => {
    if (report) {
      const fetchLocationName = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const state = data.address.state || data.address.country || '';
            const name = city && state ? `${city}, ${state}` : data.display_name.split(',').slice(0, 2).join(', ');
            setLocationName(name || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`);
          } else {
            setLocationName(`${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`);
          }
        } catch (err) {
          setLocationName(`${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`);
        }
      };
      fetchLocationName();
    }
  }, [report?.latitude, report?.longitude]);

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
      const comment = await commentApi.create(reportId, newComment.trim(), replyingTo?.id || undefined);
      setComments([...comments, comment]);
      setNewComment('');
      setReplyingTo(null);
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

  const startEditing = () => {
    if (!report) return;
    setEditTitle(report.title);
    setEditDescription(report.description);
    setEditCategory(report.category);
    setEditPosition([report.latitude, report.longitude]);
    setEditImageFile(null);
    setEditImagePreview(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!report || !editTitle.trim() || !editDescription.trim() || !editCategory) return;
    setEditSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('description', editDescription.trim());
      formData.append('category', editCategory);
      if (editPosition) {
        formData.append('latitude', String(editPosition[0]));
        formData.append('longitude', String(editPosition[1]));
      } else {
        formData.append('latitude', String(report.latitude));
        formData.append('longitude', String(report.longitude));
      }
      if (editImageFile) {
        formData.append('image', editImageFile);
      }
      const updated = await reportApi.update(reportId, formData);
      setReport({ ...report, ...updated });
      setComments(updated.comments || comments);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setEditSaving(false);
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
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-transparent">
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
    <div className="min-h-screen bg-transparent">
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
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    report.type === 'FOUND'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {report.type === 'FOUND' ? 'FOUND ITEM' : 'LOST ITEM'}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${categoryInfo.color}15`,
                    color: categoryInfo.color,
                  }}
                >
                  <img src={categoryInfo.icon} alt={categoryInfo.label} className="w-4 h-4 object-contain" />
                  {categoryInfo.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isResolved
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-200 text-emerald-800'
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

              {isEditing ? (
                /* ---- EDIT MODE ---- */
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={120}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setEditCategory(cat.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                            editCategory === cat.value
                              ? 'border-primary-500 bg-primary-50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <img src={cat.icon} alt={cat.label} className="w-7 h-7 object-contain" />
                          <span className={`text-xs font-medium ${editCategory === cat.value ? 'text-primary-700' : 'text-slate-600'}`}>
                            {cat.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Replace Image (optional)</label>
                    {editImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden bg-slate-100">
                        <img src={editImagePreview} alt="New" className="w-full max-h-48 object-cover" />
                        <button
                          onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-500">Click to upload a new image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleEditImageSelect} />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={editSaving || !editTitle.trim() || !editDescription.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
                    >
                      {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ---- VIEW MODE ---- */
                <>
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
                      {locationName}
                    </span>
                  </div>

                  {/* Owner actions */}
                  {isOwner && (
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
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
                </>
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
                <div className="space-y-6 mb-6">
                  {comments.filter(c => !c.parentId).map((comment) => (
                    <div key={comment.id} className="animate-fade-in">
                      {/* Main comment */}
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden relative">
                          <span className="relative z-0">{comment.author.name[0]?.toUpperCase()}</span>
                          <img 
                            src={userApi.getImageUrl(comment.authorId)} 
                            alt={comment.author.name} 
                            className="absolute inset-0 z-10 w-full h-full object-cover bg-white"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
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
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => setReplyingTo(comment)}
                                className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                              >
                                Reply
                              </button>
                              {comment.authorId === user?.uid && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>

                      {/* Replies */}
                      {comments.filter(r => r.parentId === comment.id).length > 0 && (
                        <div className="mt-3 ml-11 space-y-3">
                          {comments.filter(r => r.parentId === comment.id).map(reply => (
                            <div key={reply.id} className="flex gap-3 animate-fade-in relative before:absolute before:-left-6 before:top-4 before:w-4 before:h-px before:bg-slate-200">
                              <div className="shrink-0 w-6 h-6 rounded-lg bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden relative">
                                <span className="relative z-0">{reply.author.name[0]?.toUpperCase()}</span>
                                <img 
                                  src={userApi.getImageUrl(reply.authorId)} 
                                  alt={reply.author.name} 
                                  className="absolute inset-0 z-10 w-full h-full object-cover bg-white"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {reply.author.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {reply.authorId === user?.uid && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              {replyingTo && (
                <div className="flex items-center justify-between bg-primary-50 px-4 py-2 rounded-t-xl border-x border-t border-primary-100 -mb-px relative z-10">
                  <span className="text-xs font-medium text-primary-700">
                    Replying to <span className="font-bold">{replyingTo.author.name}</span>
                  </span>
                  <button onClick={() => setReplyingTo(null)} className="text-primary-500 hover:text-primary-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <form onSubmit={handleAddComment} className={`flex gap-3 ${replyingTo ? 'pt-3 border-t border-primary-100' : ''}`}>
                <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.[0]?.toUpperCase() || 'U'
                  )}
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
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      Location
                    </span>
                    {isEditing && (
                      <span className="text-xs font-normal text-slate-400">Click map to move</span>
                    )}
                  </h3>
                </div>
                <div style={{ height: '250px' }}>
                  <MapView
                    reports={isEditing && editPosition ? [] : [report]}
                    center={isEditing && editPosition ? editPosition : [report.latitude, report.longitude]}
                    zoom={15}
                    className="w-full h-full"
                    interactive={isEditing}
                    onMapClick={isEditing ? (lat, lng) => setEditPosition([lat, lng]) : undefined}
                    selectedPosition={isEditing ? editPosition : null}
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
                      <img src={categoryInfo.icon} alt={categoryInfo.label} className="w-5 h-5 object-contain" /> {categoryInfo.label}
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
