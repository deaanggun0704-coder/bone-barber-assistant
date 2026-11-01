import { describe, expect, it } from 'vitest';
import { createGoogleMapsDirectionsUrl, haversineDistanceKm } from './distance';

describe('haversineDistanceKm', () => {
  it('returns zero for the same point', () => {
    expect(haversineDistanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toBe(0);
  });

  it('calculates the approximate distance between London and Paris', () => {
    expect(haversineDistanceKm({ lat: 51.5072, lon: -0.1276 }, { lat: 48.8566, lon: 2.3522 })).toBeCloseTo(343.6, 0);
  });

  it('rejects invalid coordinates', () => {
    expect(() => haversineDistanceKm({ lat: 91, lon: 0 }, { lat: 0, lon: 0 })).toThrow(RangeError);
  });
});

describe('createGoogleMapsDirectionsUrl', () => {
  it('creates HTTPS route links with the selected travel mode and shop destination', () => {
    const url = createGoogleMapsDirectionsUrl(
      { lat: -6.7, lon: 108.55 },
      'Bone Barber Shop, Jalan Bima No. 12, Cirebon',
      'walking',
    );
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://www.google.com');
    expect(parsed.pathname).toBe('/maps/dir/');
    expect(parsed.searchParams.get('api')).toBe('1');
    expect(parsed.searchParams.get('origin')).toBe('-6.7,108.55');
    expect(parsed.searchParams.get('destination')).toBe('Bone Barber Shop, Jalan Bima No. 12, Cirebon');
    expect(parsed.searchParams.get('travelmode')).toBe('walking');
  });

  it('rejects invalid origins and empty destinations', () => {
    expect(() => createGoogleMapsDirectionsUrl({ lat: 91, lon: 0 }, 'Toko', 'driving')).toThrow(RangeError);
    expect(() => createGoogleMapsDirectionsUrl({ lat: 0, lon: 0 }, ' ', 'driving')).toThrow(RangeError);
  });
});
