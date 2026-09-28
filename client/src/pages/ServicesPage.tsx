import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Loader2,
  RefreshCw,
  LocateFixed,
  Layers,
  List,
  Map as MapIcon,
  X,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { LeafletMap } from '../components/map/LeafletMap';
import { BookingModal } from '../components/booking/BookingModal';
import { apiGet } from '../services/apiClient';
import type { ProfessionalProfile, ServiceCategory } from '../types';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter State from URL
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialEmergency = searchParams.get('emergency') === 'true' || window.location.pathname === '/emergency';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [isEmergencyOnly, setIsEmergencyOnly] = useState<boolean>(initialEmergency);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [radiusKm, setRadiusKm] = useState<number>(25);

  // Layout View mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  // Data State
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Selected Professional for Map highlighting & Booking Modal
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [bookingModalPro, setBookingModalPro] = useState<ProfessionalProfile | null>(null);

  // Sync state with URL changes
  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qCat = searchParams.get('category') || 'all';
    const qEmerg = searchParams.get('emergency') === 'true' || window.location.pathname === '/emergency';

    setSearchQuery(qSearch);
    setSelectedCategory(qCat);
    setIsEmergencyOnly(qEmerg);
  }, [searchParams]);

  // Fetch Categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Professionals whenever key filters change
  useEffect(() => {
    fetchProfessionals();
  }, [selectedCategory, isEmergencyOnly, minRating, maxPrice, sortBy, userLocation, radiusKm]);

  const fetchCategories = async () => {
    try {
      const data = await apiGet<ServiceCategory[]>('/api/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err: any) {
      console.warn('Categories API notice:', err.message);
    }
  };

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (isEmergencyOnly) {
        params.append('isEmergency', 'true');
      }
      if (minRating > 0) {
        params.append('minRating', minRating.toString());
      }
      if (maxPrice < 150) {
        params.append('maxPrice', maxPrice.toString());
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        if (radiusKm > 0) {
          params.append('radiusKm', radiusKm.toString());
        }
      }

      const data = await apiGet<ProfessionalProfile[]>(`/api/professionals?${params.toString()}`);
      setProfessionals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch professionals error:', err);
      setError(err.message || 'Unable to connect to database or services backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchQuery });
    fetchProfessionals();
  };

  const updateUrlParams = (updates: Record<string, string>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        current.set(key, val);
      } else {
        current.delete(key);
      }
    });
    setSearchParams(current);
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams({ category: slug === 'all' ? '' : slug });
  };

  // Browser Geolocation with graceful permission denial handling
  const handleRequestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSortBy('distance');
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Location permission was denied. You can manually click on the map to set your location pin.';
        if (err.code === 2) msg = 'Location unavailable. Please set your pin directly on the map.';
        if (err.code === 3) msg = 'Location request timed out. Please try again or click the map.';
        setLocationError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setLocationError(null);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setIsEmergencyOnly(false);
    setMinRating(0);
    setMaxPrice(150);
    setSortBy('rating');
    setUserLocation(null);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Verified On-Demand Local Professionals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isEmergencyOnly ? '24/7 Emergency Dispatch' : 'Service Discovery & Booking'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Find verified technicians near you, inspect live credentials, and book on-demand assistance.
            </p>
          </div>

          {/* View Toggles (Desktop & Mobile) */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setViewMode('split')}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="glass-panel p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-700/80 shadow-lg focus-within:border-indigo-500/70 transition-all">
            <div className="flex-1 flex items-center px-3 w-full">
              <Search className="w-5 h-5 text-indigo-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, pro names, or issues (e.g., Pipe burst, AC gas, Battery jump)..."
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm py-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    updateUrlParams({ search: '' });
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={isLocating}
                title="Use current GPS location"
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                  userLocation
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                ) : (
                  <LocateFixed className="w-4 h-4 text-teal-400" />
                )}
                <span>{userLocation ? 'GPS Active' : 'Nearby'}</span>
              </button>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="btn-primary-glow px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 flex items-center justify-center space-x-1.5 flex-shrink-0 w-full sm:w-auto"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Location Notice / Error Alert */}
        {locationError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
            <button onClick={() => setLocationError(null)} className="text-amber-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            All Services
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all border flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-500 text-white border-teal-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <span>{cat.name}</span>
                {cat.servicesCount !== undefined && (
                  <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded-full text-slate-400">
                    {cat.servicesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Emergency Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isEmergencyOnly}
                onChange={(e) => {
                  setIsEmergencyOnly(e.target.checked);
                  updateUrlParams({ emergency: e.target.checked ? 'true' : '' });
                }}
                className="w-4 h-4 text-rose-500 rounded focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-rose-400 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>24/7 Emergency Dispatch Only</span>
              </span>
            </label>

            {/* Min Rating */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5+ ★ Top Rated</option>
                <option value={4.8}>4.8+ ★ Elite Only</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Max Rate:</span>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                <option value={150}>Any Price</option>
                <option value={70}>Under $70/hr</option>
                <option value={90}>Under $90/hr</option>
                <option value={120}>Under $120/hr</option>
              </select>
            </div>

            {/* Radius Filter if user location is set */}
            {userLocation && (
              <div className="flex items-center space-x-1.5">
                <span className="text-teal-400 font-medium">Radius:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
                >
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                </select>
              </div>
            )}
          </div>

          {/* Sort By & Clear Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="experience">Experience Years</option>
                {userLocation && <option value="distance">Nearest Distance</option>}
              </select>
            </div>

            <button
              onClick={clearAllFilters}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      {error ? (
        /* Database / Backend Connection Error State */
        <div className="p-8 rounded-3xl glass-panel border border-rose-500/30 text-center space-y-4 max-w-2xl mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Database Service Connection Notice</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {error}.
            <br />
            <span className="text-slate-400 mt-2 block">
              Please ensure your PostgreSQL database is running on the configured DATABASE_URL and backend server port 5000 is active.
            </span>
          </p>
          <div className="pt-2">
            <button
              onClick={fetchProfessionals}
              className="btn-primary-glow px-6 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton State */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="h-[450px] bg-slate-800/40 rounded-2xl animate-pulse border border-slate-800" />
        </div>
      ) : professionals.length === 0 ? (
        /* Empty Results State */
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Professionals Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn't find verified technicians matching your current search query or active filter settings.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Main Results: Split, List, or Map Views */
        <div
          className={`grid gap-6 items-start ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* Professional Listings Cards */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`space-y-4 ${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'w-full'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing <strong className="text-white">{professionals.length}</strong> verified specialists
                </span>
                {userLocation && (
                  <span className="text-teal-400 font-medium">📍 Sorted by proximity</span>
                )}
              </div>

              <div className="space-y-4">
                {professionals.map((pro) => {
                  const isSelected = selectedProId === pro.id;
                  const proCategories = (pro as any).categories || [];

                  return (
                    <div
                      key={pro.id}
                      onClick={() => setSelectedProId(pro.id)}
                      className={`glass-card-interactive p-6 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-800/80 shadow-indigo-600/20'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                pro.user.avatarUrl ||
                                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
                              }
                              alt={pro.user.fullName}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-teal-500/40 shadow"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-teal-400" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-base font-bold text-white hover:text-teal-300 transition-colors">
                                {pro.user.fullName}
                              </h3>
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Verified
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{pro.bio}</p>

                            {/* Category Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {proCategories.map((cat: any) => (
                                <span
                                  key={cat.id}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-medium"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Rate & Rating Pill */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <div className="text-right">
                            <div className="text-lg font-extrabold text-teal-400 leading-none">
                              ${pro.hourlyRate}
                              <span className="text-xs text-slate-400 font-normal">/hr</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Base Rate</span>
                          </div>

                          <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold mt-1 sm:mt-2">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{pro.rating}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({pro.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location & Booking Actions Bar */}
                      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                          <span className="flex items-center space-x-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{pro.address}</span>
                          </span>

                          {(pro as any).distanceKm !== undefined && (pro as any).distanceKm !== null && (
                            <span className="text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                              {(pro as any).distanceKm} km away
                            </span>
                          )}

                          <span className="text-slate-500 hidden sm:inline">•</span>
                          <span className="text-slate-400">{pro.experienceYears} yrs experience</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingModalPro(pro);
                          }}
                          className="btn-primary-glow w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                        >
                          <span>Book Professional</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaflet Interactive Map View */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div
              className={`sticky top-20 ${
                viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5 h-[620px]' : 'w-full h-[650px]'
              }`}
            >
              <LeafletMap
                professionals={professionals}
                selectedProId={selectedProId}
                onSelectPro={(id) => setSelectedProId(id)}
                onBookPro={(pro) => setBookingModalPro(pro)}
                userLocation={userLocation}
                radiusKm={radiusKm}
                onMapClick={handleMapClick}
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Booking Checkout Modal */}
      <BookingModal
        isOpen={!!bookingModalPro}
        onClose={() => setBookingModalPro(null)}
        professional={bookingModalPro}
        defaultEmergency={isEmergencyOnly}
        customerLocation={userLocation}
        onBookingSuccess={(b) => {
          console.log('Successfully persisted booking:', b);
        }}
      />
    </div>
  );
};

export default ServicesPage;
