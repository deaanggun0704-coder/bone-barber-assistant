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

  it('lists the products, prices, categories, and recorded stock from the shop catalog', () => {
    const answer = getFaqAnswer('produk apa yang dijual?');
    expect(answer).toContain('Gatsby 100gram (Pomade, Rp50.000, stok tercatat 24 pcs)');
    expect(answer).toContain('Gatsby 60gr (Pomade, Rp35.000, stok tercatat 23 pcs)');
    expect(answer).toContain('Hair Tonic (Lainnya, Rp25.000, stok tercatat 28 pcs)');
    expect(answer).toContain('KMRY Hair Powder (Lainnya, Rp35.000, stok tercatat 20 pcs)');
    expect(answer).toContain('Serum Rambut Makarizo (Lainnya, Rp40.000, stok tercatat 33 pcs)');
    expect(answer).toContain('bukan data real-time');
  });

  it.each([
    'Jual produk apa saja?',
    'Ada pomade?',
    'Berapa harga produk?',
    'Produk rambut apa yang tersedia?',
  ])('answers product questions from the retail catalog: %s', (question) => {
    const answer = getFaqAnswer(question);
    expect(answer).toContain('Gatsby 100gram');
    expect(answer).toContain('Rp50.000');
    expect(answer).toContain('bukan data real-time');
  });

  it('filters a pomade question to the pomade products', () => {
    const answer = getFaqAnswer('Ada pomade?');
    expect(answer).toContain('Gatsby 100gram');
    expect(answer).toContain('Gatsby 60gr');
    expect(answer).not.toContain('Hair Tonic');
  });

  it('answers a specific product price from the catalog', () => {
    const answer = getFaqAnswer('Berapa harga KMRY Hair Powder?');
    expect(answer).toContain('KMRY Hair Powder (Lainnya, Rp35.000');
    expect(answer).not.toContain('Gatsby');
  });

  it('offers the reservation page without claiming that the requested time is available', () => {
    const answer = getFaqAnswer('bagaimana cara reservasi?');
    expect(answer).toContain('halaman Reservasi');
    expect(answer).toContain('mengonfirmasi melalui WhatsApp');
    expect(answer).toContain('belum menjamin slot tersedia');
  });

  it.each([
    'Saya mau booking.',
    'Mau reservasi.',
    'Bisa pesan tempat?',
    'Bagaimana cara booking?',
    'Saya ingin potong rambut besok.',
  ])('offers the reservation page for booking intent: %s', (question) => {
    expect(getFaqAnswer(question)).toContain('halaman Reservasi');
  });

  it('does not answer an empty question as if it were an FAQ match', () => {
    expect(getFaqAnswer('')).not.toBe(faq[0].answer);
  });
});
