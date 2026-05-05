import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private readonly config: ConfigService) {}

  async aqi(lat?: string, lng?: string) {
    // Placeholder proxy layer: wire real providers later (IQAir/OpenAQ).
    // Keep deterministic response so frontend can be built and tested.
    const latitude = lat ? Number(lat) : 21.0285;
    const longitude = lng ? Number(lng) : 105.8542;
    return {
      provider: 'mock',
      lat: latitude,
      lng: longitude,
      aqi: 75,
      category: 'Moderate',
      updatedAt: new Date().toISOString(),
    };
  }

  async weather(lat?: string, lng?: string) {
    const key = this.config.get<string>('OPENWEATHER_API_KEY') ?? '';
    const latitude = lat ? Number(lat) : 21.0285;
    const longitude = lng ? Number(lng) : 105.8542;
    return {
      provider: key ? 'openweather(todo)' : 'mock',
      lat: latitude,
      lng: longitude,
      tempC: 29,
      humidity: 70,
      updatedAt: new Date().toISOString(),
    };
  }
}

