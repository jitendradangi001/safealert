export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: 'red' | 'green' | 'blue' | 'orange' }) {
  const accentClasses: Record<string, string> = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
  };
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-panel p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? accentClasses[accent] : 'text-white'}`}>{value}</p>
    </div>
  );
}
