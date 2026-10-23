import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AlertStatus, EmergencyAlert } from '@/types';

interface UseAlertsOptions {
  /** If set, only fetch alerts belonging to this user (mobile user's own history). */
  userId?: string;
  /** Called whenever a brand-new alert row arrives via realtime. */
  onNewAlert?: (alert: EmergencyAlert) => void;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { userId, onNewAlert } = options;
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onNewAlertRef = useRef(onNewAlert);
  onNewAlertRef.current = onNewAlert;

  const fetchAlerts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAlerts((data ?? []) as EmergencyAlert[]);
      setError(null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('emergency_alerts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_alerts' },
        (payload) => {
          const newAlert = payload.new as EmergencyAlert;
          if (userId && newAlert.user_id !== userId) return;
          setAlerts((prev) => [newAlert, ...prev]);
          onNewAlertRef.current?.(newAlert);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_alerts' },
        (payload) => {
          const updated = payload.new as EmergencyAlert;
          setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createAlert = useCallback(
    async (input: {
      user_id: string;
      user_name: string;
      latitude: number | null;
      longitude: number | null;
      accuracy: number | null;
      is_test: boolean;
      device_info?: string | null;
    }) => {
      // Validate coordinates: either both present and in-range, or both null.
      const { latitude, longitude } = input;
      const coordsValid =
        (latitude === null && longitude === null) ||
        (typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180);
      if (!coordsValid) {
        return { data: null, error: 'Invalid coordinates.' };
      }

      const { data, error: insertError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: input.user_id,
          user_name: input.user_name,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          status: 'active' as AlertStatus,
          is_test: input.is_test,
          device_info: input.device_info ?? null,
        })
        .select()
        .single();

      if (insertError) return { data: null, error: insertError.message };
      return { data: data as EmergencyAlert, error: null };
    },
    []
  );

  const updateStatus = useCallback(async (id: string, status: AlertStatus) => {
    const patch: Partial<EmergencyAlert> = { status };
    if (status === 'acknowledged') patch.acknowledged_at = new Date().toISOString();
    if (status === 'resolved') patch.resolved_at = new Date().toISOString();
    const { error: updateError } = await supabase.from('emergency_alerts').update(patch).eq('id', id);
    return { error: updateError?.message ?? null };
  }, []);

  return { alerts, loading, error, refetch: fetchAlerts, createAlert, updateStatus };
}
