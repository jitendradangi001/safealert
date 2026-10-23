import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DEMO_USERS, randomDemoLocation, randomDemoUser } from '@/utils/demoData';

export default function DemoModePage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function pushLog(line: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${line}`, ...prev].slice(0, 12));
  }

  async function insertDemoAlert(userName: string) {
    if (!isSupabaseConfigured) {
      pushLog('Supabase not configured — connect it to actually write demo alerts.');
      return;
    }
    setBusy(true);
    const loc = randomDemoLocation();
    const { error } = await supabase.from('emergency_alerts').insert({
      user_id: user?.id ?? '00000000-0000-0000-0000-000000000000',
      user_name: userName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: 15,
      status: 'active',
      is_test: false,
      is_demo: true,
      device_info: 'DEMO · Simulated device',
    });
    setBusy(false);
    if (error) {
      pushLog(`Error: ${error.message}`);
    } else {
      pushLog(`Simulated alert sent for ${userName} near ${loc.label}.`);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-4 rounded-xl bg-purple-500/10 p-4 text-sm text-purple-200">
        <p className="font-semibold">🧪 Demo Mode — for the college project presentation</p>
        <p className="mt-1 text-purple-200/80">
          Use these to simulate incoming alerts and exercise the dashboard without a real second phone. Every
          row created here is clearly tagged <span className="font-semibold">DEMO</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-dash-border bg-dash-panel p-5">
          <h2 className="font-bold">Send Demo Emergency Alert</h2>
          <p className="mt-1 text-sm text-slate-400">Creates one demo alert from a random sample user and location.</p>
          <Button className="mt-4" variant="danger" disabled={busy} onClick={() => insertDemoAlert(randomDemoUser())}>
            Send Demo Emergency Alert
          </Button>
        </div>

        <div className="rounded-2xl border border-dash-border bg-dash-panel p-5">
          <h2 className="font-bold">Simulate Incoming Alert</h2>
          <p className="mt-1 text-sm text-slate-400">Pick a sample user to simulate their phone sending an alert.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u}
                disabled={busy}
                onClick={() => insertDemoAlert(u)}
                className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50"
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dash-border bg-dash-panel p-5">
        <h2 className="font-bold">Activity Log</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nothing yet — trigger a demo alert above.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {log.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Tip: open the Live Dashboard in another tab to watch demo alerts arrive instantly via Supabase Realtime.
      </p>
    </DashboardLayout>
  );
}
