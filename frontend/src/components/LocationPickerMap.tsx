"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Loader2, CheckCircle2 } from "lucide-react";

// Fix default Leaflet icon paths in Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number, addressDesc?: string) => void;
  height?: string;
  readOnly?: boolean;
}

const CITY_PRESETS = [
  { name: "Tripoli", lat: 32.8872, lon: 13.1913, address: "Al-Olaya, Tripoli" },
  { name: "Benghazi", lat: 32.1167, lon: 20.0667, address: "City Center, Benghazi" },
  { name: "Misrata", lat: 32.3754, lon: 15.0925, address: "Downtown, Misrata" },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, address: "Al-Olaya, Riyadh" },
  { name: "Jeddah", lat: 21.5433, lon: 39.1728, address: "Al-Hamra, Jeddah" },
];

export default function LocationPickerMap({
  lat,
  lng,
  onLocationSelect,
  height = "320px",
  readOnly = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [detectingGps, setDetectingGps] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Marker (draggable only if not readOnly)
    const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(map);
    markerRef.current = marker;

    const handlePositionChange = async (newLat: number, newLng: number) => {
      if (readOnly || !onLocationSelect) return;
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
        );
        const data = await res.json();
        const address = data.display_name
          ? data.display_name.split(",").slice(0, 3).join(",")
          : undefined;
        onLocationSelect(newLat, newLng, address);
      } catch {
        onLocationSelect(newLat, newLng);
      } finally {
        setGeocoding(false);
      }
    };

    if (!readOnly) {
      // Handle marker drag
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        const newLat = parseFloat(position.lat.toFixed(6));
        const newLng = parseFloat(position.lng.toFixed(6));
        handlePositionChange(newLat, newLng);
      });

      // Handle map click
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        handlePositionChange(newLat, newLng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center & marker position if props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  const handleDetectGps = () => {
    if (!navigator.geolocation) return;

    setDetectingGps(true);

    const applyCoords = (pos: GeolocationPosition) => {
      const newLat = parseFloat(pos.coords.latitude.toFixed(6));
      const newLng = parseFloat(pos.coords.longitude.toFixed(6));

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([newLat, newLng], 15);
        markerRef.current.setLatLng([newLat, newLng]);
      }

      onLocationSelect?.(newLat, newLng);
      setDetectingGps(false);
    };

    navigator.geolocation.getCurrentPosition(
      applyCoords,
      () => {
        navigator.geolocation.getCurrentPosition(
          applyCoords,
          () => setDetectingGps(false),
          { enableHighAccuracy: false, timeout: 5000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  };

  const handlePresetSelect = (preset: typeof CITY_PRESETS[0]) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lon], 13);
      markerRef.current.setLatLng([preset.lat, preset.lon]);
    }
    onLocationSelect?.(preset.lat, preset.lon, preset.address);
  };

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xs group" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Top Bar overlay */}
        {!readOnly && (
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              {geocoding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                  <span>Locating address...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Drag pin or click map to pick location</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectGps}
              disabled={detectingGps}
              className="pointer-events-auto bg-violet-600 hover:bg-violet-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              {detectingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Auto Detect</span>
            </button>
          </div>
        )}
      </div>

      {/* City Presets Bar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-gray-500 mr-1">Quick Pin Drop:</span>
          {CITY_PRESETS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handlePresetSelect(city)}
              className="px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition flex items-center gap-1 shadow-2xs"
            >
              <MapPin className="w-3 h-3 text-violet-500" />
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
