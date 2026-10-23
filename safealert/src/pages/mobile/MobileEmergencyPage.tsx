import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { EmergencyAlert } from '@/types';

function detectDeviceInfo(): string {
  const ua = navigator.userAgent;
  const platform = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : 'Desktop/Other';
  return `${platform} · ${navigator.language}`;
}

export default function MobileEmergencyPage() {
  const { user, profile, signOut } = useAuth();
  const geo = useGeolocation(true);
  const { createAlert, alerts } = useAlerts({ userId: user?.id });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIsTest, setPendingIsTest] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastAlert, setLastAlert] = useState<EmergencyAlert | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  // Guard against double-tap / accidental repeat presses while a send is in flight.
  const sendingLockRef = useRef(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Register/refresh this device's "last seen" so the dashboard's
  // Connected Devices count reflects real mobile clients.
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const ping = () =>
      supabase.from('devices').upsert(
        {
          user_id: user.id,
          device_name: `${profile?.name || 'User'}'s device`,
          device_type: detectDeviceInfo(),
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    ping();
    const interval = setInterval(ping, 60000);
    return () => clearInterval(interval);
  }, [user, profile]);

  const displayName = profile?.name || user?.email || 'Guest';

  function openConfirm(isTest: boolean) {
    setSendError(null);
    setPendingIsTest(isTest);
    setConfirmOpen(true);
  }

  async function handleConfirmSend() {
    if (sendingLockRef.current) return; // ignore duplicate presses
    if (!user) {
      setSendError('You must be logged in to send an alert.');
      setConfirmOpen(false);
      return;
    }
    sendingLockRef.current = true;
    setSending(true);
    setConfirmOpen(false);
    setSendError(null);

    try {
      const fresh = await geo.getFreshPosition();
      const hasLocation = fresh.status === 'granted' && fresh.latitude !== null && fresh.longitude !== null;

      const { data, error } = await createAlert({
        user_id: user.id,
        user_name: displayName,
        latitude: hasLocation ? fresh.latitude : null,
        longitude: hasLocation ? fresh.longitude : null,
        accuracy: hasLocation ? fresh.accuracy : null,
        is_test: pendingIsTest,
        device_info: detectDeviceInfo(),
      });

      if (error) {
        setSendError(error);
      } else if (data) {
        setLastAlert(data);
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send alert.');
    } finally {
      setSending(false);
      // Small cooldown so a lingering re-render can't trigger a second send.
      setTimeout(() => {
        sendingLockRef.current = false;
      }, 1500);
    }
  }

  const gpsStatusLabel: Record<string, { text: string; color: string }> = {
    idle: { text: 'Waiting…', color: 'text-slate-400' },
    requesting: { text: 'Locating…', color: 'text-amber-400' },
    granted: { text: 'GPS Active', color: 'text-green-400' },
    denied: { text: 'Permission Denied', color: 'text-red-400' },
    unavailable: { text: 'Unavailable', color: 'text-red-400' },
    error: { text: 'GPS Error', color: 'text-red-400' },
  };
  const gpsStatus = gpsStatusLabel[geo.status];

  return (
    <div className="min-h-screen bg-dash-bg text-white">
      <header className="flex items-center justify-between border-b border-dash-border px-4 py-3">
        <Logo size={22} />
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <button onClick={() => signOut()} className="hover:text-white">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        {/* Status panel */}
        <div className="rounded-2xl border border-dash-border bg-dash-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="font-semibold">{displayName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Connection</p>
              <p className={`text-sm font-semibold ${online ? 'text-green-400' : 'text-red-400'}`}>
                {online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-slate-400">GPS Status</p>
              <p className={`font-semibold ${gpsStatus.color}`}>{gpsStatus.text}</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-slate-400">Accuracy</p>
              <p className="font-semibold">{geo.accuracy ? `±${Math.round(geo.accuracy)} m` : '—'}</p>
            </div>
            <div className="col-span-2 rounded-xl bg-black/20 p-3 font-mono text-xs">
              <p className="text-slate-400">Latitude / Longitude</p>
              <p className="mt-1">
                {geo.latitude !== null && geo.longitude !== null
                  ? `${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)}`
                  : 'Location unavailable'}
              </p>
            </div>
          </div>

          {geo.status === 'denied' && (
            <p className="mt-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">
              Location permission was denied. You can still send an alert, but it will be marked "location
              unavailable" — enable location access in your browser settings to include GPS coordinates.
            </p>
          )}
          {geo.status === 'unavailable' && (
            <p className="mt-3 rounded-lg bg-red-500/10 p-2 text-xs text-red-300">
              This device/browser doesn't support GPS location.
            </p>
          )}
        </div>

        {/* Emergency button */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            {sending && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emergency" />}
            <button
              onClick={() => openConfirm(false)}
              disabled={sending}
              className="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full bg-emergency text-white shadow-2xl shadow-red-900/50 transition active:scale-95 disabled:opacity-70"
            >
              <span className="text-4xl">🚨</span>
              <span className="mt-2 whitespace-pre-line text-center text-lg font-extrabold leading-tight tracking-wide">
                {sending ? 'SENDING…' : 'EMERGENCY\nALERT'}
              </span>
            </button>
          </div>

          <div className="mt-6 flex w-full gap-3">
            <Button variant="outline" fullWidth className="!border-slate-600 !text-slate-200" onClick={() => openConfirm(true)} disabled={sending}>
              Test Alert
            </Button>
            <Button
              variant="ghost"
              fullWidth
              className="!text-slate-300 hover:!bg-slate-800"
              onClick={() => setLastAlert(null)}
              disabled={sending || !lastAlert}
            >
              Cancel / Dismiss
            </Button>
          </div>
        </div>

        {/* Alert status feedback */}
        {sendError && <div className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{sendError}</div>}
        {lastAlert && !sendError && (
          <div className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-300">
            <p className="font-semibold">
              {lastAlert.is_test ? 'Test alert' : 'Emergency alert'} sent successfully.
            </p>
            <p className="mt-1 text-green-200/80">
              Status: {lastAlert.status.toUpperCase()} · {new Date(lastAlert.created_at).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Recent alerts from this user */}
        {alerts.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Your recent alerts</p>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-dash-panel px-3 py-2 text-xs">
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                  <span className="font-semibold uppercase text-slate-300">
                    {a.is_test ? 'TEST · ' : ''}
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 text-slate-900 sm:rounded-2xl">
            <p className="text-lg font-bold">
              {pendingIsTest ? 'Send a TEST alert?' : 'Are you sure you want to send an emergency alert?'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {pendingIsTest
                ? 'This will be clearly marked as a test and sent to the monitoring dashboard.'
                : 'Your current GPS location will be shared with the monitoring dashboard immediately.'}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={handleConfirmSend}>
                Yes, Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
