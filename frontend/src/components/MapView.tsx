'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Report, getCategoryInfo, CATEGORIES } from '@/lib/types';
import { reportApi } from '@/lib/api';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with Leaflet
interface MapViewProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
  className?: string;
  interactive?: boolean;
}

export default function MapView({
  reports,
  center = [6.9271, 79.8612], // Default: Colombo, Sri Lanka
  zoom = 13,
  onMapClick,
  selectedPosition,
  className = '',
  interactive = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectedMarkerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix Leaflet default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: interactive,
        dragging: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks for pin dropping
      if (onMapClick) {
        map.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Add report markers
      updateMarkers(L, map, reports);

      // Add selected position marker
      if (selectedPosition) {
        updateSelectedMarker(L, map, selectedPosition);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Update markers when reports change
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current) return;

    const updateAsync = async () => {
      const L = (await import('leaflet')).default;
      updateMarkers(L, mapInstanceRef.current, reports);
    };
    updateAsync();
  }, [reports, isClient]);

  // Update selected position marker
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current) return;

    const updateAsync = async () => {
      const L = (await import('leaflet')).default;
      if (selectedPosition) {
        updateSelectedMarker(L, mapInstanceRef.current, selectedPosition);
        mapInstanceRef.current.setView(selectedPosition, 15);
      } else if (selectedMarkerRef.current) {
        mapInstanceRef.current.removeLayer(selectedMarkerRef.current);
        selectedMarkerRef.current = null;
      }
    };
    updateAsync();
  }, [selectedPosition, isClient]);

  function updateMarkers(L: any, map: any, reports: Report[]) {
    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    reports.forEach((report) => {
      if (report.status === 'RESOLVED') return; // Don't show resolved on map

      const catInfo = getCategoryInfo(report.category);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            background: ${catInfo.color};
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px ${catInfo.color}40;
            border: 2px solid white;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 16px; line-height: 1;">${catInfo.emoji}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(map);

      const popupContent = `
        <div style="padding: 12px; min-width: 200px; font-family: Inter, sans-serif;">
          ${report.hasImage ? `
            <div style="margin: -12px -12px 10px -12px; border-radius: 12px 12px 0 0; overflow: hidden;">
              <img src="${reportApi.getImageUrl(report.id)}" 
                   alt="${report.title}"
                   style="width: 100%; height: 120px; object-fit: cover;" />
            </div>
          ` : ''}
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              background: ${catInfo.color}15;
              color: ${catInfo.color};
              padding: 2px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
            ">${catInfo.emoji} ${catInfo.label}</span>
          </div>
          <h3 style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 4px; line-height: 1.3;">
            ${report.title}
          </h3>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${report.description}
          </p>
          <a href="/report/${report.id}" 
             style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #4f46e5; text-decoration: none;">
            View Details →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        closeButton: true,
      });

      markersRef.current.push(marker);
    });
  }

  function updateSelectedMarker(L: any, map: any, position: [number, number]) {
    if (selectedMarkerRef.current) {
      map.removeLayer(selectedMarkerRef.current);
    }

    const icon = L.divIcon({
      className: 'selected-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 24px;
            height: 24px;
            background: #4f46e5;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 2px #4f46e5, 0 4px 12px rgba(79, 70, 229, 0.4);
          "></div>
          <div style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid #4f46e5;
            opacity: 0.4;
            animation: pulse-ring 1.5s ease-out infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    selectedMarkerRef.current = L.marker(position, { icon }).addTo(map);
  }

  if (!isClient) {
    return (
      <div className={`bg-slate-100 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-slate-400 text-sm">Loading map...</div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}
