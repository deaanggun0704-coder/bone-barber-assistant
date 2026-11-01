import type { ReservationDraft } from '../types/reservation';

export function createReservationWhatsAppUrl(adminNumber: string, reservation: ReservationDraft): string | null {
  const number = adminNumber.replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(number)) return null;

  const message = [
    'Halo Admin Bone Barber Shop 👋',
    '',
    'Saya ingin mengajukan reservasi:',
    '',
    `Nama: ${reservation.name.trim()}`,
    `Nomor WhatsApp: ${reservation.phone.trim() || '-'}`,
    `Layanan: ${reservation.service}`,
    `Tanggal: ${reservation.date}`,
    `Jam: ${reservation.time}`,
    `Barber: ${reservation.barber || '-'}`,
    `Catatan: ${reservation.notes.trim() || '-'}`,
    '',
    'Mohon konfirmasi apakah jadwal tersebut tersedia. Terima kasih.',
  ].join('\n');

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function createProductInquiryWhatsAppUrl(adminNumber: string, productName: string): string | null {
  const number = adminNumber.replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(number)) return null;

  const message = [
    'Halo Admin Bone Barber Shop, saya ingin bertanya tentang ketersediaan produk.',
    '',
    `Produk: ${productName}`,
    'Mohon konfirmasi stok terbaru. Terima kasih.',
  ].join('\n');

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
