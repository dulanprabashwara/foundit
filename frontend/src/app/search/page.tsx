'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Filter, Loader2, Search, SearchX, Sparkles, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReportCard from '@/components/ReportCard';
import { useAuth } from '@/contexts/AuthContext';
import { reportApi } from '@/lib/api';
import { CATEGORIES, type Report } from '@/lib/types';

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [authLoading, router, user]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const { data: reports = [], error, isLoading } = useSWR<Report[]>(
    user ? `/reports/search?query=${debouncedQuery}&category=${activeCategory}` : null,
    () => reportApi.list({
      query: debouncedQuery || undefined,
      category: activeCategory !== 'ALL' ? activeCategory : undefined,
    }),
    { keepPreviousData: true, revalidateOnFocus: false, refreshInterval: 60000 }
  );

  const hasFilters = Boolean(query) || activeCategory !== 'ALL';

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="page-shell py-8 sm:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[32px] bg-slate-950 px-6 py-9 text-white shadow-2xl shadow-slate-950/10 sm:px-10 sm:py-12">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <span className="eyebrow text-indigo-300"><Sparkles className="h-3.5 w-3.5" /> Search the community</span>
            <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">A better chance of finding the right match.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Search active reports by title, then narrow the results to the category that best describes the item.</p>

            <label className="relative mt-7 block max-w-2xl">
              <span className="sr-only">Search report titles</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “black wallet” or “golden retriever”"
                autoFocus
                className="w-full rounded-2xl border border-white/10 bg-white py-4 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-xl outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-400/30"
              />
              {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search"><X className="h-4 w-4" /></button>}
            </label>
          </div>
        </section>

        <section className="app-surface mb-7 rounded-3xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Filter className="h-4 w-4 text-indigo-600" />Category</div>
            {hasFilters && <button onClick={() => { setQuery(''); setActiveCategory('ALL'); }} className="text-xs font-bold text-indigo-700 hover:text-indigo-900">Reset</button>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setActiveCategory('ALL')} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${activeCategory === 'ALL' ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>All items</button>
            {CATEGORIES.map((category) => (
              <button key={category.value} onClick={() => setActiveCategory(category.value)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${activeCategory === category.value ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                <img src={category.icon} alt="" className="h-4 w-4 object-contain" />{category.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500"><strong className="font-extrabold text-slate-900">{reports.length}</strong> {reports.length === 1 ? 'matching report' : 'matching reports'}</p>
          {debouncedQuery !== query.trim() && <span className="flex items-center gap-2 text-xs font-medium text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Searching…</span>}
        </div>

        {error ? (
          <div className="app-surface rounded-3xl px-6 py-16 text-center"><SearchX className="mx-auto h-8 w-8 text-rose-400" /><h2 className="mt-4 font-bold text-slate-900">Search is temporarily unavailable</h2><p className="mt-1 text-sm text-slate-500">Please refresh the page and try again.</p></div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-3xl border border-slate-200 bg-white"><div className="h-52 rounded-t-3xl bg-slate-100" /><div className="space-y-3 p-5"><div className="h-4 w-1/3 rounded bg-slate-100" /><div className="h-5 w-3/4 rounded bg-slate-100" /><div className="h-4 w-full rounded bg-slate-100" /></div></div>)}</div>
        ) : reports.length === 0 ? (
          <div className="app-surface rounded-[32px] px-6 py-16 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500"><SearchX className="h-7 w-7" /></span><h2 className="mt-5 text-xl font-extrabold text-slate-900">No matching reports yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try a shorter title or a different category. New community reports are added throughout the day.</p><button onClick={() => { setQuery(''); setActiveCategory('ALL'); }} className="mt-6 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Browse all reports</button></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{reports.map((report, index) => <ReportCard key={report.id} report={report} index={index} />)}</div>
        )}
      </main>
    </div>
  );
}
