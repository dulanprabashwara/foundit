'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/lib/api';
import type { Report } from '@/lib/types';

type NearbyReport = Report & { distance: number };

interface CommentNotification {
  id: string;
  author?: { name: string };
  report: { id: string; title: string };
  parent?: { authorId: string } | null;
}

interface NotificationResponse {
  reports?: NearbyReport[];
  comments?: CommentNotification[];
}

const navLinks = [
  { href: '/dashboard', label: 'Discover', icon: LayoutDashboard },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/my-reports', label: 'My reports', icon: MapPin },
  { href: '/settings', label: 'Profile', icon: Settings },
];

function readGeofence() {
  try {
    const saved = localStorage.getItem('foundit_geofence');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [nearbyReports, setNearbyReports] = useState<NearbyReport[]>([]);
  const [commentNotifications, setCommentNotifications] = useState<CommentNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsFetched, setNotificationsFetched] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const notificationCount = nearbyReports.length + commentNotifications.length;

  const loadNotifications = useCallback(async (useDefault = false) => {
    const saved = readGeofence();
    const geofence = saved || (useDefault ? { latitude: 6.9271, longitude: 79.8612, radius: 5 } : null);
    if (!geofence) return;

    setNotificationsLoading(true);
    try {
      const data = (await notificationApi.check(
        geofence.latitude,
        geofence.longitude,
        geofence.radius
      )) as NotificationResponse;
      setNearbyReports(data.reports || []);
      setCommentNotifications(data.comments || []);
      setNotificationsFetched(true);
    } catch {
      setNearbyReports([]);
      setCommentNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !notificationsFetched && readGeofence()) {
      const timeout = window.setTimeout(() => void loadNotifications(), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [loadNotifications, notificationsFetched, user]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-[0_1px_0_rgba(16,24,40,0.02)] backdrop-blur-xl">
      <div className="page-shell flex h-[72px] items-center justify-between gap-4">
        <Link href="/dashboard" className="group flex items-center gap-3" aria-label="FoundIt dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:-translate-y-0.5">
            <MapPin className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-extrabold tracking-[-0.04em] text-slate-950">FoundIt</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 lg:flex" aria-label="Primary navigation">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                isActive(href)
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/70'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
              }`}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/report/new"
            className="hidden items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 sm:flex"
          >
            <Plus className="h-4 w-4" />
            New report
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileOpen(false);
                if (!notificationsFetched) void loadNotifications(true);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-[18px] w-[18px]" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white ring-2 ring-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <button className="fixed inset-0 z-40 cursor-default" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" />
                <div className="app-surface absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-900">Notifications</p>
                      <p className="mt-0.5 text-xs text-slate-500">Nearby activity and conversations</p>
                    </div>
                    {notificationCount > 0 && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{notificationCount} new</span>}
                  </div>
                  <div className="max-h-[380px] overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Checking nearby activity…
                      </div>
                    ) : notificationCount === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Bell className="h-5 w-5" /></span>
                        <p className="font-semibold text-slate-800">You’re all caught up</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">New reports in your saved area and replies will appear here.</p>
                      </div>
                    ) : (
                      <>
                        {commentNotifications.slice(0, 5).map((comment) => (
                          <button key={comment.id} onClick={() => { setNotificationsOpen(false); router.push(`/report/${comment.report.id}`); }} className="flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><MessageSquare className="h-4 w-4" /></span>
                            <span className="min-w-0 text-sm leading-5 text-slate-600"><strong className="font-semibold text-slate-900">{comment.author?.name || 'Someone'}</strong>{comment.parent?.authorId === user?.uid ? ' replied on ' : ' commented on '}<strong className="font-semibold text-slate-800">{comment.report.title}</strong></span>
                          </button>
                        ))}
                        {nearbyReports.slice(0, 5).map((report) => (
                          <button key={report.id} onClick={() => { setNotificationsOpen(false); router.push(`/report/${report.id}`); }} className="flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><MapPin className="h-4 w-4" /></span>
                            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{report.title}</span><span className="mt-0.5 block text-xs text-slate-500">{report.distance} km away · {report.type === 'LOST' ? 'Lost' : 'Found'}</span></span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                  <Link href="/settings" onClick={() => setNotificationsOpen(false)} className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-bold text-indigo-700 hover:bg-indigo-50">
                    Manage notification area <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button type="button" onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-sm font-bold text-white ring-1 ring-slate-900/10 transition-shadow hover:ring-4 hover:ring-indigo-100" aria-label="Open profile menu" aria-expanded={profileOpen}>
              {user?.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </button>
            {profileOpen && (
              <>
                <button className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileOpen(false)} aria-label="Close profile menu" />
                <div className="app-surface absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl p-2">
                  <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><CircleUserRound className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-900">{user?.displayName || 'Your profile'}</span><span className="block truncate text-xs text-slate-500">{user?.email}</span></span>
                  </Link>
                  <div className="my-1 h-px bg-slate-100" />
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Sign out</button>
                </div>
              </>
            )}
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive(href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <Link href="/report/new" onClick={() => setMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Create a report</Link>
            <button onClick={handleSignOut} className="col-span-2 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </nav>
      )}
    </header>
  );
}
