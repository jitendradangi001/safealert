import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoState } from '@/types';

const initialState: GeoState = {
  status: 'idle',
  latitude: null,
  longitude: null,
  accuracy: null,
};

/**
 * Wraps the browser Geolocation API. Never invents coordinates: if
 * permission is denied or the API is unavailable, latitude/longitude stay
 * null and `status` reflects why.
 */
export function useGeolocation(watch = true) {
  const [state, setState] = useState<GeoState>(initialState);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setState({
      status: 'granted',
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
      error: err.message,
    }));
  }, []);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({ ...prev, status: 'unavailable', error: 'Geolocation is not supported on this device.' }));
      return;
    }
    setState((prev) => ({ ...prev, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (!watch) return;
    if (!('geolocation' in navigator)) {
      setState((prev) => ({ ...prev, status: 'unavailable', error: 'Geolocation is not supported on this device.' }));
      return;
    }
    requestLocation();
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  /** Get a single fresh reading right now, for the moment the alert is sent. */
  const getFreshPosition = useCallback((): Promise<GeoState> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const fallback: GeoState = { ...initialState, status: 'unavailable', error: 'Geolocation not supported.' };
        setState(fallback);
        resolve(fallback);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next: GeoState = {
            status: 'granted',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setState(next);
          resolve(next);
        },
        (err) => {
          const next: GeoState = {
            ...state,
            status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
            error: err.message,
          };
          setState(next);
          resolve(next);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, requestLocation, getFreshPosition };
}
