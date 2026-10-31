import { describe, expect, it } from 'vitest';
import { haversineDistanceKm } from './distance';

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
