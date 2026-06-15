export function googleMapsDirectionsUrl(input: {
  destinationLat: number;
  destinationLng: number;
  originLat?: number;
  originLng?: number;
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}) {
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', `${input.destinationLat},${input.destinationLng}`);
  if (input.originLat != null && input.originLng != null) {
    url.searchParams.set('origin', `${input.originLat},${input.originLng}`);
  }
  url.searchParams.set('travelmode', input.travelMode ?? 'walking');
  return url.toString();
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const v = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(v)));
}

export function getAqiForSpot(spot: { id: string; lat: number; lng: number }, defaultAqi: number): number {
  const centerLat = 21.015;
  const centerLng = 105.843;
  const dist = haversineKm(spot.lat, spot.lng, centerLat, centerLng);
  if (dist <= 1.5) {
     const hash = spot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     return 20 + (hash % 31); // 20 to 50
  }
  return defaultAqi;
}
