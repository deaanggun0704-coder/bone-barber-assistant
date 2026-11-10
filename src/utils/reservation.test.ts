import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReservationSummary } from '../components/reservation/ReservationSummary';
import { businessConfig } from '../data/businessConfig';
import { shop } from '../data/shop';
import type { ReservationDraft } from '../types/reservation';
import {
  formatReservationDate,
  getAvailableReservationTimes,
  getJakartaDateTime,
  validateReservation,
} from './reservation';
import { createProductInquiryWhatsAppUrl, createReservationWhatsAppUrl } from './whatsapp';

const now = new Date('2026-10-31T02:00:00.000Z');
const validDraft: ReservationDraft = {
  name: 'Andi',
  phone: '',
  service: 'Haircut Reguler',
  date: '2026-11-02',
  time: '09:00',
  barber: '',
  notes: '',
};

describe('reservation validation', () => {
  it('requires a customer name, service, date, and arrival time', () => {
    const errors = validateReservation({ ...validDraft, name: '', service: '', date: '', time: '' }, now);
    expect(errors.name).toBe('Nama wajib diisi.');
    expect(errors.service).toBeDefined();
    expect(errors.date).toBeDefined();
    expect(errors.time).toBeDefined();
  });

  it('requires a phone number and rejects an invalid supplied number', () => {
    expect(validateReservation(validDraft, now).phone).toBe('Nomor WhatsApp wajib diisi.');
    expect(validateReservation({ ...validDraft, phone: '081234567890' }, now).phone).toBeUndefined();
    expect(validateReservation({ ...validDraft, phone: '123abc' }, now).phone).toContain('nomor WhatsApp yang valid');
  });

  it('rejects a date in the past using Jakarta calendar time', () => {
    const errors = validateReservation({ ...validDraft, date: '2026-10-30' }, now);
    expect(errors.date).toContain('masa lalu');
  });

  it('rejects a start time that leaves insufficient time before closing', () => {
    const errors = validateReservation({ ...validDraft, time: '19:31' }, now);
    expect(errors.time).toContain('sebelum toko tutup');
  });

  it('rejects malformed clock values', () => {
    expect(validateReservation({ ...validDraft, time: '25:90' }, now).time).toBe('Pilih jam kedatangan yang valid.');
  });

  it('builds arrival choices from the configured hours and service duration', () => {
    const times = getAvailableReservationTimes('2026-11-02', 'Haircut Reguler', now);
    expect(times[0]).toBe('09:00');
    expect(times[times.length - 1]).toBe('19:30');
    expect(getAvailableReservationTimes('2026-11-02', 'unknown', now)).toEqual([]);
    expect(businessConfig.openingHoursLabel).toBe('Senin–Sabtu: 09.00–20.00; Minggu: 10.00–20.00');
  });

  it('uses Asia/Jakarta for current date and formats reservation dates in that timezone', () => {
    expect(getJakartaDateTime(new Date('2026-10-31T17:30:00.000Z'))).toEqual({ date: '2026-11-01', time: '00:30' });
    expect(formatReservationDate('2026-11-02')).toContain('Senin');
  });
});

describe('reservation summary and WhatsApp link', () => {
  it('renders the reservation details as escaped text in the summary', () => {
    const markup = renderToStaticMarkup(createElement(ReservationSummary, {
      reservation: { ...validDraft, notes: '<script>alert(1)</script>' },
      status: '',
      onEdit: () => undefined,
      onSend: () => undefined,
    }));
    expect(markup).toContain('Haircut Reguler');
    expect(markup).toContain('Senin, 2 November 2026');
    expect(markup).toContain('&lt;script&gt;');
    expect(markup).not.toContain('<script>');
  });

  it('creates an encoded wa.me URL with the requested message fields', () => {
    const url = createReservationWhatsAppUrl('+62 857-2003-5403', validDraft);
    if (!url) throw new Error('Configured admin number should create a WhatsApp URL.');
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://wa.me');
    expect(parsed.pathname).toBe('/6285720035403');
    const message = parsed.searchParams.get('text') ?? '';
    expect(message).toContain('Halo Admin Bone Barber Shop 👋');
    expect(message).toContain('Nama: Andi');
    expect(message).toContain('Layanan: Haircut Reguler');
    expect(message).toContain('Mohon konfirmasi apakah jadwal tersebut tersedia.');
  });

  it('does not make a WhatsApp link for an unconfigured admin number', () => {
    expect(createReservationWhatsAppUrl('', validDraft)).toBeNull();
    expect(createReservationWhatsAppUrl('Perlu diisi admin', validDraft)).toBeNull();
  });

  it('creates an HTTPS WhatsApp product inquiry with its selected category', () => {
    const url = createProductInquiryWhatsAppUrl(businessConfig.adminWhatsApp, 'Pomade 120gr');
    if (!url) throw new Error('Configured admin number should create a WhatsApp URL.');
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://wa.me');
    expect(parsed.pathname).toBe('/6285720035403');
    expect(parsed.searchParams.get('text')).toContain('Produk: Pomade 120gr');
    expect(createProductInquiryWhatsAppUrl('', 'Pomade')).toBeNull();
  });

  it('keeps the retail catalog products, prices, categories, and recorded stock', () => {
    expect(shop.products).toEqual([
      { name: 'Gatsby 100gram', category: 'Pomade', price: 'Rp50.000', stock: 24, unit: 'pcs' },
      { name: 'Gatsby 60gr', category: 'Pomade', price: 'Rp35.000', stock: 23, unit: 'pcs' },
      { name: 'Hair Tonic', category: 'Lainnya', price: 'Rp25.000', stock: 28, unit: 'pcs' },
      { name: 'KMRY Hair Powder', category: 'Lainnya', price: 'Rp35.000', stock: 20, unit: 'pcs' },
      { name: 'Serum Rambut Makarizo', category: 'Lainnya', price: 'Rp40.000', stock: 33, unit: 'pcs' },
    ]);
  });
});
