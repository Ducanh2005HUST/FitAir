import type { Location } from '../data/mockData';
import type { SpotDto } from '../api/types';
import { haversineKm } from '../utils/maps';

export function spotToLocation(
  spot: SpotDto,
  aqiValue: number,
  coords?: { lat: number; lng: number } | null
): Location {
  const image = spot.imageUrls?.[0] ?? '';
  const indoor = spot.type === 'indoor';
  let distanceKm = typeof spot.distanceKm === 'number' ? Number(spot.distanceKm.toFixed(2)) : 0;
  
  if (!distanceKm && coords && typeof spot.lat === 'number' && typeof spot.lng === 'number') {
    distanceKm = Number(haversineKm(coords.lat, coords.lng, spot.lat, spot.lng).toFixed(2));
  }

  return {
    id: spot.id,
    name: spot.name,
    nameVi: spot.name,
    type: indoor ? 'gym' : 'park',
    rating: Number(spot.avgRating ?? 0),
    distance: distanceKm,
    price: spot.price ?? (indoor ? 'paid' : 'free'),
    indoor,
    image,
    lat: spot.lat,
    lng: spot.lng,
    aqi: aqiValue,
    temperature: 28,
    crowdLevel: 'medium',
    facilities: spot.facilities ?? [],
    reviews: [],
    sportTypes: spot.sports ?? [],
    district: spot.district ?? '',
  };
}
