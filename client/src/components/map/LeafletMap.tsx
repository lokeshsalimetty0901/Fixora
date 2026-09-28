import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ProfessionalProfile } from '../../types';
import { Star, ShieldCheck, MapPin } from 'lucide-react';

interface LeafletMapProps {
  professionals: ProfessionalProfile[];
  selectedProId: string | null;
  onSelectPro: (proId: string) => void;
  onBookPro: (pro: ProfessionalProfile) => void;
  userLocation: { lat: number; lng: number } | null;
  radiusKm?: number;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  professionals,
  selectedProId,
  onSelectPro,
  onBookPro,
  userLocation,
  radiusKm,
  onMapClick,
  className = 'h-[500px] w-full rounded-2xl',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (e.g. NYC coordinates or first pro or userLocation)
    const initialLat = userLocation?.lat || (professionals[0]?.latitude ?? 40.7128);
    const initialLng = userLocation?.lng || (professionals[0]?.longitude ?? -74.006);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Map click handler for picking customer location
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user location pin and radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      // User custom location pin with pulsing beacon
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-cyan-500/40 animate-ping"></span>
            <div class="relative w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      userMarker.bindTooltip('<span class="font-bold text-xs">Your Location</span>', {
        permanent: false,
        direction: 'top',
      });
      userMarkerRef.current = userMarker;

      // Draw radius circle if requested
      if (radiusKm && radiusKm > 0) {
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusKm * 1000,
          color: '#0d9488',
          fillColor: '#14b8a6',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '5, 8',
        }).addTo(map);
        radiusCircleRef.current = circle;
      }
    }
  }, [userLocation, radiusKm]);

  // Update Professional Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    professionals.forEach((pro) => {
      const isSelected = selectedProId === pro.id;

      // Custom DivIcon for Professional
      const proIcon = L.divIcon({
        className: 'custom-pro-pin',
        html: `
          <div class="relative group cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="px-2 py-1 rounded-xl shadow-xl flex items-center space-x-1.5 border ${
              isSelected
                ? 'bg-indigo-600 text-white border-teal-300 ring-2 ring-teal-400 shadow-indigo-600/50'
                : 'bg-slate-900 text-slate-100 border-slate-700/80 hover:border-indigo-400'
            }">
              <div class="w-2 h-2 rounded-full ${pro.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></div>
              <span class="text-xs font-bold">$${pro.hourlyRate}</span>
              <span class="text-[10px] text-amber-400 flex items-center">★${pro.rating}</span>
            </div>
            <div class="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 mx-auto transform rotate-45 -mt-1 ${isSelected ? 'bg-indigo-600 border-teal-300' : ''}"></div>
          </div>
        `,
        iconSize: [70, 36],
        iconAnchor: [35, 36],
      });

      const marker = L.marker([pro.latitude, pro.longitude], { icon: proIcon }).addTo(markersLayer);

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-900 min-w-[210px]';
      popupDiv.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center justify-between border-b pb-1.5">
            <div>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">${pro.user.fullName}</h4>
              <p class="text-[11px] text-slate-500 truncate max-w-[140px]">${pro.bio}</p>
            </div>
            <span class="text-xs font-bold text-emerald-600">$${pro.hourlyRate}/hr</span>
          </div>
          <div class="text-[11px] text-slate-600 flex items-center justify-between">
            <span>Rating: <strong class="text-amber-500">★ ${pro.rating}</strong> (${pro.reviewCount})</span>
            <span>${pro.experienceYears} yrs exp</span>
          </div>
          <div class="text-[10px] text-slate-500 truncate">
            📍 ${pro.address}
          </div>
          <button id="book-pro-${pro.id}" class="w-full mt-2 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center justify-center space-x-1">
            <span>Book This Pro</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        onSelectPro(pro.id);
        const bookBtn = document.getElementById(`book-pro-${pro.id}`);
        if (bookBtn) {
          bookBtn.onclick = (e) => {
            e.stopPropagation();
            onBookPro(pro);
          };
        }
      });

      marker.on('click', () => {
        onSelectPro(pro.id);
      });
    });

    // If a professional was selected externally, pan map smoothly to their location
    if (selectedProId) {
      const selected = professionals.find((p) => p.id === selectedProId);
      if (selected) {
        map.flyTo([selected.latitude, selected.longitude], 14, { duration: 0.6 });
      }
    }
  }, [professionals, selectedProId]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className={className} style={{ minHeight: '380px' }} />

      {/* Map Helper overlay badge */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl glass-panel border border-slate-700/80 bg-slate-900/90 shadow-md text-xs font-medium text-slate-300 flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>Interactive Service Map • Click map to set pin</span>
        </div>
      </div>
    </div>
  );
};
