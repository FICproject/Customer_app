import { Platform } from 'react-native';
import { API_URL_ANDROID, API_URL_IOS } from './env';

const CANDIDATE_URLS = Platform.select({
  android: [
    'http://localhost:5000/api',
    'http://192.168.0.127:5000/api',
    API_URL_ANDROID,
    'http://10.0.2.2:5000/api',
  ],
  ios: [
    API_URL_IOS,
    'http://localhost:5000/api',
    'http://192.168.0.127:5000/api',
  ],
  default: [
    API_URL_IOS,
    'http://localhost:5000/api',
    'http://192.168.0.127:5000/api',
  ],
}) || ['http://localhost:5000/api', 'http://192.168.0.127:5000/api'];


let activeBackendUrl = CANDIDATE_URLS[0];

// Haversine distance formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate intermediate coordinates for maps routing
export function generateInterpolatedRoute(lat1: number, lon1: number, lat2: number, lon2: number, steps = 15): [number, number][] {
  const path: [number, number][] = [];
  const midLat = lat1 + (lat2 - lat1) * 0.45;
  const midLng = lon1 + (lon2 - lon1) * 0.65;

  const controlPoints: [number, number][] = [
    [lat1, lon1],
    [midLat, lon1],
    [midLat, midLng],
    [lat2, midLng],
    [lat2, lon2]
  ];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    const segSteps = Math.ceil(steps / 4);
    for (let j = 0; j < segSteps; j++) {
      const t = j / segSteps;
      const lt = start[0] + (end[0] - start[0]) * t;
      const ln = start[1] + (end[1] - start[1]) * t;
      path.push([lt + Math.sin(j) * 0.0001, ln + Math.cos(j) * 0.0001]);
    }
  }
  path.push([lat2, lon2]);
  return path;
}

/**
 * Main API Fetch function that routes directly to MongoDB Atlas Backend with multi-host fallback
 */
export const apiFetch = async (endpoint: string, options: any = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const isGetOrHead = method === 'GET' || method === 'HEAD';

  const fetchOptions: any = {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    },
  };

  if (isGetOrHead) {
    delete fetchOptions.body;
  } else if (options.body && typeof options.body !== 'string') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Ordered list of URLs to try: active host first, then other candidates
  const urlsToTry = [
    activeBackendUrl,
    ...CANDIDATE_URLS.filter((u) => u !== activeBackendUrl),
  ];

  let lastError: any = null;

  for (const baseUrl of urlsToTry) {
    const fullUrl = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);


    try {
      const res = await fetch(fullUrl, {
        signal: controller.signal,
        ...fetchOptions,
      });
      clearTimeout(timeoutId);

      // Successfully connected: cache working host
      activeBackendUrl = baseUrl;

      const contentType = res.headers.get('content-type') || '';
      let responseData: any = null;

      if (contentType.includes('application/json')) {
        const text = await res.text();
        try {
          responseData = text ? JSON.parse(text) : {};
        } catch {
          responseData = { message: text };
        }
      } else {
        const text = await res.text();
        responseData = { message: text };
      }

      if (!res.ok) {
        throw new Error(responseData.message || responseData.error || `HTTP ${res.status}`);
      }

      return responseData;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      // If error is HTTP error from server (i.e. server reached and responded 4xx/5xx), don't retry other hosts
      if (err.message && err.message.startsWith('HTTP')) {
        throw err;
      }
      // Connection failed on this baseUrl, loop to next candidate
    }
  }

  console.warn(`[API Warning] All backend hosts unreachable for ${method} ${endpoint}:`, lastError?.message || lastError);
  throw lastError || new Error('Backend server unreachable');
};
