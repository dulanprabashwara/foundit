'use client';

import React from 'react';
import { Report, getCategoryInfo } from '@/lib/types';
import { reportApi } from '@/lib/api';
import { MapPin, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ReportCardProps {
  report: Report;
  index?: number;
}

export default function ReportCard({ report, index = 0 }: ReportCardProps) {
  const categoryInfo = getCategoryInfo(report.category);
  const isResolved = report.status === 'RESOLVED';
  const timeAgo = getTimeAgo(new Date(report.createdAt));

  return (
    <Link
      href={`/report/${report.id}`}
      className={`block group animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
      style={{ opacity: 0 }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isResolved
            ? 'bg-slate-50 border-slate-200 opacity-60'
            : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5'
        }`}
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Distance Badge (Mocked for now) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-[10px] font-bold shadow-sm">
            <MapPin className="w-3 h-3 text-rose-500" />
            2.1 km away
          </div>
          
          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
            isResolved 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-rose-100 text-rose-600'
          }`}>
            {isResolved ? 'RESOLVED' : (report.id.length % 2 === 0 ? 'LOST' : 'FOUND')}
          </div>
        </div>

        {/* Image */}
        {report.hasImage ? (
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img
              src={reportApi.getImageUrl(report.id)}
              alt={report.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isResolved ? 'grayscale opacity-80' : ''
              }`}
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`h-48 flex items-center justify-center bg-indigo-50/50`}>
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
                  <img src={categoryInfo.icon} alt={categoryInfo.label} className="w-16 h-16 object-contain mb-2 opacity-50" />
                </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className={`font-bold text-lg mb-2 line-clamp-1 ${
            isResolved ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-700'
          } transition-colors`}>
            {report.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {report.description}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700"
            >
              <img src={categoryInfo.icon} alt={categoryInfo.label} className="w-4 h-4 object-contain" />
              {categoryInfo.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
          </div>

          <div className="h-px w-full bg-slate-100 mb-4" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {report.author?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-500">{report.author?.name || 'User'}</span>
            </div>
            
            <span className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
              {isResolved ? 'View Details' : (report.id.length % 2 === 0 ? 'Claim Item' : 'I Found This')}
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
