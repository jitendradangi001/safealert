import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dash-bg to-slate-900 text-white">
      {!isSupabaseConfigured && (
        <div className="bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-yellow-950">
          Supabase is not configured yet. Copy .env.example to .env.local and add your project keys. See README.md.
        </div>
      )}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size={30} />
        <nav className="flex gap-3 text-sm">
          <Link to="/login" className="rounded-lg px-3 py-2 hover:bg-white/10">
            Log in
          </Link>
          <Link to="/signup" className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 text-center">
        <span className="inline-block rounded-full bg-emergency/20 px-3 py-1 text-xs font-semibold text-red-300">
          Educational / Demo Emergency System
        </span>
        <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
          Emergency Alert &amp; Location Tracking
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          SafeAlert lets a mobile user send a one-tap emergency alert with their live GPS location to a
          real-time monitoring dashboard on a PC. Built as a college project demo — it does{' '}
          <strong>not</strong> contact police, ambulance, or any real emergency service.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/mobile"
            className="group rounded-2xl border border-emergency/40 bg-emergency/10 p-8 text-left transition hover:bg-emergency/20"
          >
            <p className="text-3xl">📱</p>
            <h2 className="mt-3 text-xl font-bold">Mobile Emergency</h2>
            <p className="mt-1 text-sm text-slate-300">
              Open this on your phone. Press the emergency button to send your location.
            </p>
            <p className="mt-4 text-sm font-semibold text-red-300 group-hover:underline">Open mobile view →</p>
          </Link>

          <Link
            to="/dashboard"
            className="group rounded-2xl border border-blue-400/40 bg-blue-500/10 p-8 text-left transition hover:bg-blue-500/20"
          >
            <p className="text-3xl">🖥️</p>
            <h2 className="mt-3 text-xl font-bold">PC Monitoring Dashboard</h2>
            <p className="mt-1 text-sm text-slate-300">
              Open this on a computer to watch for incoming alerts in real time.
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-300 group-hover:underline">Open dashboard →</p>
          </Link>
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300">
          <p className="font-semibold text-white">Location permission required</p>
          <p className="mt-1">
            Sending an emergency alert needs access to your device's GPS location so the dashboard can show
            where the alert came from. Your browser will ask for permission the first time — if you decline,
            you can still send an alert, but it will be marked "location unavailable" rather than guessing
            where you are.
          </p>
        </div>
      </main>
    </div>
  );
}
