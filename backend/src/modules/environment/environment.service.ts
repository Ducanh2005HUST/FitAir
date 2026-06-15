import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function pm25ToUsAqi(pm25: number) {
  // US EPA breakpoints (µg/m3) for PM2.5, 24-hour.
  const bps = [
    { cLow: 0.0, cHigh: 12.0, aLow: 0, aHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, aLow: 51, aHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, aLow: 101, aHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, aLow: 151, aHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, aLow: 201, aHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, aLow: 301, aHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, aLow: 401, aHigh: 500 },
  ] as const;

  const c = Math.max(0, pm25);
  const bp = bps.find((x) => c >= x.cLow && c <= x.cHigh) ?? bps[bps.length - 1];
  const aqi = ((bp.aHigh - bp.aLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.aLow;
  return Math.round(Math.min(500, Math.max(0, aqi)));
}

function usAqiCategory(aqi: number) {
  if (aqi <= 50) return '良好';
  if (aqi <= 100) return '普通';
  if (aqi <= 150) return '敏感な方は注意';
  if (aqi <= 200) return '悪い';
  if (aqi <= 300) return '非常に悪い';
  return '危険';
}

@Injectable()
export class EnvironmentService {
  private readonly aqiCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly weatherCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 mins

  constructor(private readonly config: ConfigService) {}

  async aqi(lat?: string, lng?: string) {
    const latitude = lat ? Number(lat) : 21.0285;
    const longitude = lng ? Number(lng) : 105.8542;

    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.aqiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const iqairKey = this.config.get<string>('IQAIR_API_KEY') ?? '';
    if (iqairKey) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      try {
        const url = new URL('https://api.airvisual.com/v2/nearest_city');
        url.searchParams.set('lat', String(latitude));
        url.searchParams.set('lon', String(longitude));
        url.searchParams.set('key', iqairKey);

        const res = await fetch(url.toString(), { signal: ctrl.signal });
        const data = (await res.json()) as any;
        const pollution = data?.data?.current?.pollution;

        const aqius = Number(pollution?.aqius ?? NaN);
        const aqicn = Number(pollution?.aqicn ?? NaN);
        if (!Number.isFinite(aqius)) throw new Error('IQAir: missing aqius');

        const result = {
          provider: 'iqair',
          lat: latitude,
          lng: longitude,
          aqi: aqius,
          category: usAqiCategory(aqius),
          aqicn: Number.isFinite(aqicn) ? aqicn : null,
          mainus: pollution?.mainus ?? null,
          maincn: pollution?.maincn ?? null,
          city: data?.data?.city ?? null,
          state: data?.data?.state ?? null,
          country: data?.data?.country ?? null,
          updatedAt: new Date().toISOString(),
        };
        this.aqiCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
        return result;
      } catch {
        // fall through to OpenWeather/mock
      } finally {
        clearTimeout(t);
      }
    }

    const key = this.config.get<string>('OPENWEATHER_API_KEY') ?? '';
    if (!key) {
      const result = {
        provider: 'mock',
        lat: latitude,
        lng: longitude,
        aqi: 75,
        category: '普通',
        updatedAt: new Date().toISOString(),
      };
      this.aqiCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const url = new URL('https://api.openweathermap.org/data/2.5/air_pollution');
      url.searchParams.set('lat', String(latitude));
      url.searchParams.set('lon', String(longitude));
      url.searchParams.set('appid', key);

      const res = await fetch(url.toString(), { signal: ctrl.signal });
      const data = (await res.json()) as any;
      const first = data?.list?.[0];
      const pm25 = Number(first?.components?.pm2_5 ?? NaN);
      const openWeatherAqiIndex = Number(first?.main?.aqi ?? NaN); // 1..5

      if (!Number.isFinite(pm25)) throw new Error('OpenWeather air pollution: missing pm2_5');
      const aqiValue = pm25ToUsAqi(pm25);

      const result = {
        provider: 'openweather',
        lat: latitude,
        lng: longitude,
        aqi: aqiValue,
        category: usAqiCategory(aqiValue),
        pm2_5: pm25,
        openWeatherAqiIndex: Number.isFinite(openWeatherAqiIndex) ? openWeatherAqiIndex : null,
        updatedAt: new Date().toISOString(),
      };
      this.aqiCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    } catch {
      const result = {
        provider: 'mock',
        lat: latitude,
        lng: longitude,
        aqi: 75,
        category: '普通',
        updatedAt: new Date().toISOString(),
      };
      this.aqiCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    } finally {
      clearTimeout(t);
    }
  }

  async weather(lat?: string, lng?: string) {
    const key = this.config.get<string>('OPENWEATHER_API_KEY') ?? '';
    const latitude = lat ? Number(lat) : 21.0285;
    const longitude = lng ? Number(lng) : 105.8542;

    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (!key) {
      const result = {
        provider: 'mock',
        lat: latitude,
        lng: longitude,
        tempC: 29,
        humidity: 70,
        updatedAt: new Date().toISOString(),
      };
      this.weatherCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const url = new URL('https://api.openweathermap.org/data/2.5/weather');
      url.searchParams.set('lat', String(latitude));
      url.searchParams.set('lon', String(longitude));
      url.searchParams.set('appid', key);
      url.searchParams.set('units', 'metric');
      url.searchParams.set('lang', 'ja');

      const res = await fetch(url.toString(), { signal: ctrl.signal });
      const data = (await res.json()) as any;
      const tempC = Number(data?.main?.temp ?? NaN);
      const humidity = Number(data?.main?.humidity ?? NaN);
      const description = String(data?.weather?.[0]?.description ?? '');

      if (!Number.isFinite(tempC) || !Number.isFinite(humidity)) throw new Error('OpenWeather: missing main');

      const result = {
        provider: 'openweather',
        lat: latitude,
        lng: longitude,
        tempC,
        humidity,
        description: description || undefined,
        updatedAt: new Date().toISOString(),
      };
      this.weatherCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    } catch {
      const result = {
        provider: 'mock',
        lat: latitude,
        lng: longitude,
        tempC: 29,
        humidity: 70,
        updatedAt: new Date().toISOString(),
      };
      this.weatherCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return result;
    } finally {
      clearTimeout(t);
    }
  }
}
