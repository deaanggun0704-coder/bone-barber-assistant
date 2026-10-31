import { describe, expect, it } from 'vitest';
import { faq, getFaqAnswer, outsideTopicAnswer } from './faq';

describe('getFaqAnswer', () => {
  it('answers a known location question from local FAQ data', () => {
    expect(getFaqAnswer('Alamat Bone Barber di mana?')).toContain('Jalan Bima No. 12');
  });

  it('returns the explicit out-of-topic message', () => {
    expect(getFaqAnswer('bagaimana resep nasi goreng?')).toBe(outsideTopicAnswer);
  });

  it('answers with the confirmed opening hours', () => {
    const answer = getFaqAnswer('jam buka hari ini');
    expect(answer).toContain('Senin–Sabtu: 09.00–20.00');
    expect(answer).toContain('Minggu: 10.00–20.00');
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

  it('directs reservation questions to the reservation form and says admin confirms', () => {
    const answer = getFaqAnswer('bagaimana cara reservasi?');
    expect(answer).toContain('halaman Reservasi');
    expect(answer).toContain('menunggu konfirmasi admin/kasir');
  });

  it('does not answer an empty question as if it were an FAQ match', () => {
    expect(getFaqAnswer('')).not.toBe(faq[0].answer);
  });
});
