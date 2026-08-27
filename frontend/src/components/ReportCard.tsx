'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock3, MapPin, MessageCircle } from 'lucide-react';
import LocationName from './LocationName';
import { reportApi } from '@/lib/api';
import { getCategoryInfo, type Report } from '@/lib/types';

interface ReportCardProps {
  report: Report;
  index?: number;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ReportCard({ report, index = 0 }: ReportCardProps) {
  const category = getCategoryInfo(report.category);
  const resolved = report.status === 'RESOLVED';
  const commentCount = report._count?.comments || report.comments?.length || 0;

  return (
    <Link
      href={`/report/${report.id}`}
      className={`group block h-full animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
      style={{ opacity: 0 }}
      aria-label={`View ${report.type.toLowerCase()} report: ${report.title}`}
    >
      <article className={`flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(16,24,40,0.10)] ${resolved ? 'border-slate-200 opacity-75' : 'border-slate-200/90 group-hover:border-indigo-200'}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {report.hasImage ? (
            <img
              src={reportApi.getImageUrl(report.id)}
              alt={report.title}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${resolved ? 'grayscale' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="relative flex h-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-white to-indigo-50">
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl" />
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/70 transition-transform duration-500 group-hover:scale-105">
                <img src={category.icon} alt="" className="h-11 w-11 object-contain" />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3.5">
            <span className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.09em] text-white shadow-sm backdrop-blur ${report.type === 'FOUND' ? 'bg-emerald-600/95' : 'bg-rose-600/95'}`}>
              {report.type}
            </span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.06em] shadow-sm backdrop-blur ${resolved ? 'bg-slate-900/80 text-white' : 'bg-white/92 text-emerald-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${resolved ? 'bg-slate-300' : 'bg-emerald-500'}`} />
              {resolved ? 'RESOLVED' : 'ACTIVE'}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700">
              <img src={category.icon} alt="" className="h-4 w-4 object-contain" />
              {category.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              {getTimeAgo(new Date(report.createdAt))}
            </span>
          </div>

          <h3 className="line-clamp-1 text-[17px] font-extrabold tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-indigo-700">
            {report.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{report.description}</p>

          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <LocationName latitude={report.latitude} longitude={report.longitude} className="truncate" />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-extrabold text-white">
                {report.author?.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="truncate text-xs font-semibold text-slate-600">{report.author?.name || 'Community member'}</span>
            </div>
            <div className="ml-3 flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400"><MessageCircle className="h-3.5 w-3.5" />{commentCount}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all group-hover:bg-indigo-600 group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
