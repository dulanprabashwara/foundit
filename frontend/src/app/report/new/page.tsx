'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MapView from '@/components/MapView';
import { reportApi } from '@/lib/api';
import { CATEGORIES, Category } from '@/lib/types';
import {
  Upload,
  Image as ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Camera,
  Navigation,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Upload Photo', icon: Camera, description: 'Add an image of the item' },
  { id: 2, title: 'Item Details', icon: FileText, description: 'Describe what was lost or found' },
  { id: 3, title: 'Set Location', icon: MapPin, description: 'Mark where it was seen' },
];

export default function NewReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setError('');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) {
        handleImageSelect(e.dataTransfer.files[0]);
      }
    },
    [handleImageSelect]
  );

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeolocating(false);
      },
      (err) => {
        setError('Failed to get your location. Please set it manually.');
        setGeolocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Image is optional
      case 2:
        return title.trim() && description.trim() && category;
      case 3:
        return position !== null;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!position || !category || !title.trim() || !description.trim()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('latitude', String(position[0]));
      formData.append('longitude', String(position[1]));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await reportApi.create(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Report an Item</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new lost or found item report
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isActive ? 'text-primary-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                      currentStep > step.id ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Step 1: Image Upload */}
          {currentStep === 1 && (
            <div className="p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Upload a Photo</h2>
              <p className="text-sm text-slate-500 mb-6">
                Adding a photo helps others identify the item quickly. This step is optional.
              </p>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-80 object-contain"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-xs font-medium">
                    {imageFile?.name} • {((imageFile?.size || 0) / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
                    dragActive
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-slate-300 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-primary-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Drop your image here, or{' '}
                      <span className="text-primary-600">browse</span>
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG, WebP up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageSelect(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Item Details</h2>
              <p className="text-sm text-slate-500 mb-6">
                Provide as much detail as possible to help identify the item.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="e.g., Lost golden retriever near Central Park"
                    maxLength={120}
                  />
                  <p className="text-xs text-slate-400 mt-1">{title.length}/120 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    placeholder="Provide details about the item, distinguishing features, when/where it was last seen..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                          category === cat.value
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl">{cat.emoji}</span>
                        <span
                          className={`text-xs font-medium ${
                            category === cat.value ? 'text-primary-700' : 'text-slate-600'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Set Location</h2>
              <p className="text-sm text-slate-500 mb-4">
                Click on the map to drop a pin where the item was lost or found.
              </p>

              <button
                onClick={handleUseMyLocation}
                disabled={geolocating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors mb-4"
              >
                {geolocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Use My Current Location
              </button>

              {position && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl text-sm text-primary-700 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </span>
                  <button
                    onClick={() => setPosition(null)}
                    className="ml-auto text-primary-500 hover:text-primary-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height: '400px' }}>
                <MapView
                  reports={[]}
                  onMapClick={handleMapClick}
                  selectedPosition={position}
                  className="w-full h-full"
                />
              </div>

              {!position && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Click on the map to set the item&apos;s location
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 animate-fade-in">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => {
                if (currentStep === 1) router.push('/dashboard');
                else setCurrentStep(currentStep - 1);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Publish Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
