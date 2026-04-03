import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rates, FALLBACK_RATES, STORAGE_KEY } from '../constants/rates';

const MDIV_API = 'https://mdiv.pro/api/rates';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

function timeAgo(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return dateString;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `hace ${diffHrs} hr`;
    const diffDays = Math.floor(diffHrs / 24);
    return `hace ${diffDays} días`;
  } catch {
    return dateString;
  }
}

async function fetchFromMdiv(): Promise<{ rates?: Rates; error?: string }> {
  try {
    const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(MDIV_API)}`;
    const res = await fetch(PROXY_URL);
    if (!res.ok) return { error: `HTTP ${res.status}` };

    const wrapper = await res.json();
    if (!wrapper.contents) return { error: 'Proxy vacío' };

    const json = JSON.parse(wrapper.contents);
    if (!json?.success || !json?.data?.rates) return { error: 'Formato de datos inválido' };

    const r = json.data.rates;
    const usd = parseFloat(r.avgUsdOverallRate);
    const eur = parseFloat(r.avgEurOverallRate);
    const mlc = parseFloat(r.avgMlcOverallRate);
    const ts = json.data.timestamp;

    if (isNaN(usd) || usd <= 0) return { error: 'Tasas inválidas recibidas' };

    return {
      rates: {
        USD: Math.round(usd * 100) / 100,
        EUR: Math.round((isNaN(eur) ? usd * 1.1 : eur) * 100) / 100,
        MLC: Math.round((isNaN(mlc) ? usd * 0.76 : mlc) * 100) / 100,
        timestamp: ts ? formatTime(ts) : new Date().toLocaleString('es-CU'),
        source: 'mdiv.pro',
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de red / CORS';
    return { error: msg };
  }
}

export interface UseRatesResult {
  rates: Rates;
  loading: boolean;
  status: string;
  isLive: boolean;
  refresh: () => Promise<void>;
}

export function useRates(): UseRatesResult {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const fetchRates = useCallback(async () => {
    setLoading(true);

    const result = await fetchFromMdiv();
    if (result.rates) {
      setRates(result.rates);
      setStatus(`✓ ${result.rates.source} · ${result.rates.timestamp}`);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result.rates));
      setLoading(false);
      return;
    }

    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Rates;
        setRates(parsed);
        const relative = parsed.timestamp ? timeAgo(parsed.timestamp) : '';
        setStatus(`Caché (${result.error}) · ${relative}`);
        setLoading(false);
        return;
      }
    } catch {}

    setRates(FALLBACK_RATES);
    setStatus(`Sin conexión (${result.error})`);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load cache instantly, then fetch live
    AsyncStorage.getItem(STORAGE_KEY).then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Rates;
          setRates(parsed);
          const relative = parsed.timestamp ? timeAgo(parsed.timestamp) : '';
          setStatus(`Caché · ${relative}`);
        } catch {}
      }
    });
    fetchRates();
  }, [fetchRates]);

  const isLive = Boolean(rates.source && rates.source !== 'fallback');

  return { rates, loading, status, isLive, refresh: fetchRates };
}
