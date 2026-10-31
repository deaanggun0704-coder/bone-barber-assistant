import type { Coordinate } from '../data/shop';

const earthRadiusKm = 6371.0088;

export function haversineDistanceKm(from: Coordinate, to: Coordinate): number {
  for (const point of [from, to]) {
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon) ||
      point.lat < -90 || point.lat > 90 || point.lon < -180 || point.lon > 180) {
      throw new RangeError('Koordinat latitude/longitude tidak valid.');
    }
  }

  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lon - from.lon);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) *
    Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(Math.min(1, a)));
}
