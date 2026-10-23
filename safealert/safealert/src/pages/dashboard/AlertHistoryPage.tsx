import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { MapView } from '@/components/MapView';
import { useAlerts } from '@/hooks/useAlerts';
import type { AlertStatus, EmergencyAlert } from '@/types';

type DateFilter = 'all' | 'today' | '7days' | '30days';

export default function AlertHistoryPage() {
  const { alerts, loading } = useAlerts();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [mapAlert, setMapAlert] = useState<EmergencyAlert | null>(null);

  const users = useMemo(() => Array.from(new Set(alerts.map((a) => a.user_name))).sort(), [alerts]);

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff: Record<DateFilter, Date | null> = {
      all: null,
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      '7days': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30days': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    return alerts.filter((a) => {
      if (cutoff[dateFilter] && new Date(a.created_at) < cutoff[dateFilter]!) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (userFilter !== 'all' && a.user_name !== userFilter) return false;
      return true;
    });
  }, [alerts, dateFilter, statusFilter, userFilter]);

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold">Alert History</h1>
      <p className="mt-1 text-sm text-slate-400">Browse and filter previously received alerts.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', 'today', '7days', '30days'] as DateFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              dateFilter === f ? 'bg-blue-600 text-white' : 'bg-dash-panel text-slate-300 hover:bg-white/10'
            }`}
          >
            {{ all: 'All time', today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days' }[f]}
          </button>
        ))}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
          className="rounded-full border border-dash-border bg-dash-panel px-3 py-1.5 text-xs font-semibold text-slate-200"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-full border border-dash-border bg-dash-panel px-3 py-1.5 text-xs font-semibold text-slate-200"
        >
          <option value="all">All users</option>
          {users.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-dash-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-dash-panel text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Map</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No alerts match these filters.
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="text-slate-200">
                <td className="px-4 py-3 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {a.user_name}
                  {a.is_test && <span className="ml-2 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-300">TEST</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {a.latitude !== null && a.longitude !== null ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}` : 'Unavailable'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setMapAlert(a)} className="text-blue-400 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mapAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setMapAlert(null)}>
          <div className="h-[70vh] w-full max-w-2xl rounded-2xl bg-dash-panel p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold">
                {mapAlert.user_name} · {new Date(mapAlert.created_at).toLocaleString()}
              </p>
              <button onClick={() => setMapAlert(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <MapView alert={mapAlert} className="h-[calc(100%-2rem)] w-full" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
