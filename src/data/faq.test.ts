import { describe, expect, it } from 'vitest';
import { faq, getFaqAnswer, outsideTopicAnswer } from './faq';

describe('getFaqAnswer', () => {
  it('answers a known location question from local FAQ data', () => {
    expect(getFaqAnswer('Alamat Bone Barber di mana?')).toContain('Jalan Bima No. 12');
  });

  it('returns the explicit out-of-topic message', () => {
    expect(getFaqAnswer('bagaimana resep nasi goreng?')).toBe(outsideTopicAnswer);
  });

  it('uses the not-yet-configured placeholder for missing operational info', () => {
    expect(getFaqAnswer('jam buka hari ini')).toContain('Perlu diisi admin');
  });

  it('uses the unavailable-information response for an unsupported shop question', () => {
    expect(getFaqAnswer('apakah ada promo bulan ini?')).toContain('informasi tersebut belum tersedia');
  });

  it('answers prices using the seeded service catalog and warns that they need confirmation', () => {
    const answer = getFaqAnswer('berapa harga potong rambut?');
    expect(answer).toContain('Haircut Reguler: Rp35.000');
    expect(answer).toContain('belum dikonfirmasi admin');
  });

  it('lists product categories without inventing retail prices or stock', () => {
    const answer = getFaqAnswer('produk apa yang dijual?');
    expect(answer).toContain('Pomade');
    expect(answer).toContain('harga jual, dan stok');
  });

  it('does not answer an empty question as if it were an FAQ match', () => {
    expect(getFaqAnswer('')).not.toBe(faq[0].answer);
  });
});
