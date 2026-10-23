import type { EmergencyAlert } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

interface AlertCardProps {
  alert: EmergencyAlert;
  onView: (alert: EmergencyAlert) => void;
  onAcknowledge?: (alert: EmergencyAlert) => void;
  onResolve?: (alert: EmergencyAlert) => void;
  distanceKm?: number | null;
  selected?: boolean;
}

export function AlertCard({ alert, onView, onAcknowledge, onResolve, distanceKm, selected }: AlertCardProps) {
  const hasLocation = alert.latitude !== null && alert.longitude !== null;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        selected ? 'border-blue-500 bg-blue-950/40' : 'border-dash-border bg-dash-panel'
      } ${alert.status === 'active' ? 'ring-1 ring-emergency/60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{alert.user_name}</p>
            {alert.is_test && (
              <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-300">TEST</span>
            )}
            {alert.is_demo && (
              <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">DEMO</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{new Date(alert.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={alert.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div>
          <p className="text-slate-500">Latitude</p>
          <p className="font-mono">{hasLocation ? alert.latitude!.toFixed(5) : '—'}</p>
        </div>
        <div>
          <p className="text-slate-500">Longitude</p>
          <p className="font-mono">{hasLocation ? alert.longitude!.toFixed(5) : '—'}</p>
        </div>
        {distanceKm != null && (
          <div className="col-span-2">
            <p className="text-slate-500">Distance</p>
            <p>{distanceKm.toFixed(1)} km away</p>
          </div>
        )}
        {!hasLocation && <p className="col-span-2 text-amber-400">Location unavailable</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" className="!border-slate-600 !text-slate-200 hover:!bg-slate-700" onClick={() => onView(alert)}>
          View Location
        </Button>
        {alert.status === 'active' && onAcknowledge && (
          <Button variant="secondary" onClick={() => onAcknowledge(alert)}>
            Acknowledge
          </Button>
        )}
        {alert.status !== 'resolved' && onResolve && (
          <Button variant="safe" onClick={() => onResolve(alert)}>
            Resolve
          </Button>
        )}
      </div>
    </div>
  );
}
