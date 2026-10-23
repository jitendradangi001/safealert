export type UserRole = 'mobile_user' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface EmergencyAlert {
  id: string;
  user_id: string;
  user_name: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  created_at: string;
  status: AlertStatus;
  is_test: boolean;
  is_demo?: boolean;
  acknowledged_at: string | null;
  resolved_at: string | null;
  device_info?: string | null;
}

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  last_seen: string;
  created_at: string;
}

export interface GeoState {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error?: string;
}
