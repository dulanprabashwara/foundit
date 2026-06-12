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
        {/* Status ribbon */}
        {isResolved && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </div>
        )}

        {/* Image */}
        {report.hasImage ? (
          <div className="relative h-44 overflow-hidden bg-slate-100">
            <img
              src={reportApi.getImageUrl(report.id)}
              alt={report.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isResolved ? 'grayscale' : ''
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div className={`h-32 flex items-center justify-center bg-gradient-to-br ${
            isResolved ? 'from-slate-100 to-slate-200' : 'from-primary-50 to-primary-100'
          }`}>
            <span className="text-4xl">{categoryInfo.emoji}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${categoryInfo.color}15`,
                color: categoryInfo.color,
              }}
            >
              <span>{categoryInfo.emoji}</span>
              {categoryInfo.label}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-base mb-1.5 line-clamp-1 ${
            isResolved ? 'text-slate-500' : 'text-slate-800 group-hover:text-primary-700'
          } transition-colors`}>
            {report.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {report.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {report._count?.comments || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
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
