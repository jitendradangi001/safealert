import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import type { EmergencyAlert } from '@/types';

// Leaflet's default marker icons reference files that don't resolve under
// bundlers; point them at a CDN so markers actually render.
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const emergencyIcon = L.divIcon({
  className: '',
  html: `<div style="background:#dc2626;width:22px;height:22px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 4px rgba(220,38,38,0.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() < 13 ? 15 : map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function MapView({ alert, className = '' }: { alert: EmergencyAlert | null; className?: string }) {
  if (!alert || alert.latitude === null || alert.longitude === null) {
    return (
      <div className={`flex h-full items-center justify-center rounded-xl bg-slate-100 text-slate-500 ${className}`}>
        <div className="text-center">
          <p className="text-2xl">📍</p>
          <p className="mt-1 text-sm font-medium">Location unavailable</p>
        </div>
      </div>
    );
  }

  const { latitude, longitude } = alert;

  return (
    <div className={className}>
      <MapContainer center={[latitude, longitude]} zoom={15} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={alert.status === 'active' ? emergencyIcon : defaultIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{alert.user_name}</p>
              <p>{new Date(alert.created_at).toLocaleString()}</p>
              <p className="uppercase">{alert.status}</p>
            </div>
          </Popup>
        </Marker>
        <Recenter lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
