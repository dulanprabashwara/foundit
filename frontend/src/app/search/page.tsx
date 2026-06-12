'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { reportApi } from '@/lib/api';
import { Report, getCategoryInfo, CATEGORIES } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MapPin, Clock, Filter, X } from 'lucide-react';

function timeAgo(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await reportApi.list({
        query: query.trim() || undefined,
        category: activeCategory !== 'ALL' ? activeCategory : undefined
      });
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search typing
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-12 py-8 flex flex-col">
        {/* Header & Search Bar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Search Reports</h1>
          
          <div className="relative max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg transition-all"
              placeholder="Search lost items by name or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3 md:justify-between w-full min-w-max md:min-w-0 md:flex-wrap">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === 'ALL'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <img src={cat.icon} alt={cat.label} className="w-5 h-5 object-contain" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No results found</h3>
              <p className="text-slate-500 max-w-md">
                We couldn't find any reports matching "{query}". Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reports.map((report) => {
                const catInfo = getCategoryInfo(report.category);
                return (
                  <div
                    key={report.id}
                    onClick={() => router.push(`/report/${report.id}`)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-200 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {report.hasImage ? (
                        <img
                          src={reportApi.getImageUrl(report.id)}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
                          <img src={catInfo.icon} alt={catInfo.label} className="w-16 h-16 object-contain mb-2 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
                        <img src={catInfo.icon} alt={catInfo.label} className="w-4 h-4 object-contain" />
                        {catInfo.label}
                      </div>
                      {report.status === 'RESOLVED' && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">
                          RESOLVED
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                        {report.description}
                      </p>

                      <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeAgo(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
