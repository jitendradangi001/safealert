import type { AlertStatus } from '@/types';

const styles: Record<AlertStatus, string> = {
  active: 'bg-red-100 text-red-700 ring-1 ring-red-300',
  acknowledged: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300',
  resolved: 'bg-green-100 text-green-700 ring-1 ring-green-300',
};

const labels: Record<AlertStatus, string> = {
  active: 'ACTIVE',
  acknowledged: 'ACKNOWLEDGED',
  resolved: 'RESOLVED',
};

export function StatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
