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

