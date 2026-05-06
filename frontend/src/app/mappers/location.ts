import type { Location } from '../data/mockData';
import type { SpotDto } from '../api/types';

export function spotToLocation(spot: SpotDto, aqiValue: number): Location {
  const image = spot.imageUrls?.[0] ?? '/src/imports/image-0.png';
  const indoor = spot.type === 'indoor';
  const distanceKm = typeof spot.distanceKm === 'number' ? Number(spot.distanceKm.toFixed(2)) : 0;
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
    sportTypes: (spot.sports ?? []).map((s) => `${s} / ${s}`),
    district: spot.district ?? '',
  };
}
