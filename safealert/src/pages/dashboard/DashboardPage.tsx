import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { AlertCard } from '@/components/AlertCard';
import { MapView } from '@/components/MapView';
import { Button } from '@/components/Button';
import { useAlerts } from '@/hooks/useAlerts';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { playAlertSound, requestNotificationPermission, showBrowserNotification } from '@/utils/notify';
import type { EmergencyAlert } from '@/types';

export default function DashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [flash, setFlash] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<number>(0);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const { alerts, loading, error, updateStatus } = useAlerts({
    onNewAlert: (alert) => {
      setFlash(true);
      playAlertSound();
      showBrowserNotification('🚨 NEW EMERGENCY ALERT', `${alert.user_name} · ${new Date(alert.created_at).toLocaleTimeString()}`);
      setTimeout(() => setFlash(false), 4000);
    },
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('devices')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setConnectedDevices(count ?? 0));
  }, []);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) setSelectedAlert(alerts[0]);
  }, [alerts, selectedAlert]);

  async function enableNotifications() {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  }

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const active = alerts.filter((a) => a.status === 'active').length;
    const alertsToday = alerts.filter((a) => new Date(a.created_at) >= today).length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;
    return { active, alertsToday, resolved };
  }, [alerts]);

  const activeFirst = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        const order = { active: 0, acknowledged: 1, resolved: 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [alerts]
  );

  return (
    <DashboardLayout
      liveIndicator={
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          Live · Realtime connected
          {notifPermission !== 'granted' && (
            <button onClick={enableNotifications} className="ml-2 rounded bg-white/10 px-2 py-1 hover:bg-white/20">
              Enable desktop notifications
            </button>
          )}
        </div>
      }
    >
      {flash && (
        <div className="mb-4 animate-pulse rounded-xl border border-red-500 bg-red-600/20 p-4">
          <p className="text-lg font-extrabold text-red-300">🚨 NEW EMERGENCY ALERT</p>
        </div>
      )}

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-yellow-500/10 p-4 text-sm text-yellow-300">
          Supabase isn't configured — connect it in .env.local to see real alerts. Try Demo Mode in the sidebar
          instead.
        </div>
      )}
      {error && <div className="mb-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Alerts" value={stats.active} accent="red" />
        <StatCard label="Alerts Today" value={stats.alertsToday} accent="orange" />
        <StatCard label="Resolved" value={stats.resolved} accent="green" />
        <StatCard label="Connected Devices" value={connectedDevices} accent="blue" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Emergency Alerts</p>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            {loading && <p className="text-sm text-slate-400">Loading alerts…</p>}
            {!loading && activeFirst.length === 0 && (
              <p className="rounded-xl border border-dashed border-dash-border p-6 text-center text-sm text-slate-500">
                No alerts yet. They'll appear here instantly when sent from a mobile device.
              </p>
            )}
            {activeFirst.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                selected={selectedAlert?.id === alert.id}
                onView={setSelectedAlert}
                onAcknowledge={(a) => updateStatus(a.id, 'acknowledged')}
                onResolve={(a) => updateStatus(a.id, 'resolved')}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Location</p>
          <div className="h-[65vh] overflow-hidden rounded-2xl border border-dash-border">
            <MapView alert={selectedAlert} className="h-full w-full" />
          </div>
          {selectedAlert && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-dash-panel p-3 text-xs text-slate-300">
              <span>
                {selectedAlert.user_name} · {new Date(selectedAlert.created_at).toLocaleString()}
              </span>
              {selectedAlert.status === 'active' && (
                <Button variant="secondary" onClick={() => updateStatus(selectedAlert.id, 'acknowledged')}>
                  Acknowledge
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
