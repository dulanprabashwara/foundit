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
  selectedReportId?: string | null;
  onReportSelect?: (id: string) => void;
  className?: string;
  interactive?: boolean;
}

export default function MapView({
  reports,
  center = [6.9271, 79.8612], // Default: Colombo, Sri Lanka
  zoom = 13,
  onMapClick,
  selectedPosition,
  selectedReportId,
  onReportSelect,
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
      updateMarkers(L, map, reports, selectedReportId);

      // Add selected position marker (for new report drop pin)
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

  // Update markers when reports or selectedReportId change
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current) return;

    const updateAsync = async () => {
      const L = (await import('leaflet')).default;
      updateMarkers(L, mapInstanceRef.current, reports, selectedReportId);
      
      // Pan to selected report
      if (selectedReportId) {
        const report = reports.find(r => r.id === selectedReportId);
        if (report) {
          mapInstanceRef.current.flyTo([report.latitude, report.longitude], 15, { animate: true, duration: 1 });
        }
      }
    };
    updateAsync();
  }, [reports, selectedReportId, isClient]);

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

  function updateMarkers(L: any, map: any, reports: Report[], selectedId?: string | null) {
    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    reports.forEach((report) => {
      if (report.status === 'RESOLVED') return; // Don't show resolved on map

      const isSelected = report.id === selectedId;
      const isLost = report.id.length % 2 === 0; // Mock LOST vs FOUND
      const color = isLost ? '#ef4444' : '#10b981'; // Red for Lost, Green for Found
      
      // We will render an HTML marker that looks like the screenshot
      // A circle with an image inside, a pointer at the bottom, and a glowing ring if selected
      
      const imageUrl = report.hasImage ? reportApi.getImageUrl(report.id) : null;
      
      const html = `
        <div style="position: relative; display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -100%); width: 64px; height: 64px;">
          ${isSelected ? `
            <div style="
              position: absolute;
              top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 90px; height: 90px;
              border-radius: 50%;
              background: ${color}30;
              border: 2px solid ${color}80;
              animation: pulse 2s infinite;
              z-index: 1;
              pointer-events: none;
            "></div>
            <div style="
              position: absolute;
              top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 130px; height: 130px;
              border-radius: 50%;
              background: ${color}15;
              border: 1px solid ${color}40;
              animation: pulse 2.5s infinite reverse;
              z-index: 0;
              pointer-events: none;
            "></div>
          ` : ''}
          
          <div style="
            position: relative;
            z-index: 10;
            width: 48px; height: 48px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid ${isSelected ? '#ffffff' : color};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            margin: 0 auto;
            transition: all 0.3s ease;
            ${isSelected ? 'transform: scale(1.1);' : ''}
          ">
            ${imageUrl 
              ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : `<span style="font-size: 20px;">${getCategoryInfo(report.category).emoji}</span>`
            }
          </div>
          <div style="
            width: 0; height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 10px solid ${color};
            margin: 0 auto;
            margin-top: -2px;
            z-index: 9;
            ${isSelected ? 'transform: scale(1.1); transform-origin: top;' : ''}
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html,
        iconSize: [0, 0], // Position handled by CSS transform
        iconAnchor: [0, 0], 
      });

      const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(map);

      if (onReportSelect) {
        marker.on('click', () => {
          onReportSelect(report.id);
        });
      }

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
