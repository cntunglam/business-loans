import { CONFIG } from '../config';

export async function getPlaceRating(placeId: string): Promise<any> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${CONFIG.GOOGLE_MAPS_API_KEY}&fields=rating`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const placeDetails = await response.json();

  return { placeId, details: placeDetails };
}

export async function getPlacesRating(placeIds: string[]): Promise<any> {
  const placeDetailsPromises = placeIds.map((placeId) => getPlaceRating(placeId));
  const placeDetails = await Promise.all(placeDetailsPromises);
  return placeDetails;
}
