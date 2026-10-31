import { businessConfig } from '../data/businessConfig';
import type { ReservationDraft, ReservationErrors } from '../types/reservation';

export const reservationLimits = {
  name: 100,
  phone: 20,
  notes: 500,
} as const;

export function getJakartaDateTime(date = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: businessConfig.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
  };
}

export function getOperatingHours(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return undefined;
  const weekday = parsed.getUTCDay();
  if (businessConfig.closedDays.includes(weekday)) return undefined;
  return businessConfig.openingHoursByDay[weekday as keyof typeof businessConfig.openingHoursByDay];
}

function getDurationMinutes(serviceName: string): number | undefined {
  const service = businessConfig.services.find((item) => item.name === serviceName);
  if (!service) return undefined;
  const minutes = Number(service.duration.match(/\d+/)?.[0]);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
}

export function getAvailableReservationTimes(date: string, serviceName: string, now = new Date()): string[] {
  const hours = getOperatingHours(date);
  const duration = getDurationMinutes(serviceName);
  if (!hours || !duration) return [];

  const toMinutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  const opening = toMinutes(hours.open);
  const closing = toMinutes(hours.close);
  const current = getJakartaDateTime(now);
  const earliest = date === current.date ? toMinutes(current.time) + 1 : opening;
  const slots: string[] = [];

  for (let start = opening; start + duration <= closing; start += 30) {
    if (start < earliest) continue;
    slots.push(`${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`);
  }
  return slots;
}

export function validateReservation(draft: ReservationDraft, now = new Date()): ReservationErrors {
  const errors: ReservationErrors = {};
  const name = draft.name.trim();
  if (!name) errors.name = 'Nama wajib diisi.';
  else if (name.length > reservationLimits.name) errors.name = `Nama maksimal ${reservationLimits.name} karakter.`;

  const phone = draft.phone.trim();
  if (phone.length > reservationLimits.phone) errors.phone = `Nomor WhatsApp maksimal ${reservationLimits.phone} karakter.`;
  else if (phone && !/^\+?\d{8,15}$/.test(phone.replace(/[\s()-]/g, ''))) {
    errors.phone = 'Masukkan nomor WhatsApp yang valid, 8–15 digit.';
  }

  if (!businessConfig.services.some((service) => service.name === draft.service)) {
    errors.service = 'Pilih layanan dari daftar.';
  }

  const current = getJakartaDateTime(now);
  if (!draft.date) errors.date = 'Tanggal reservasi wajib dipilih.';
  else if (!getOperatingHours(draft.date)) {
    errors.date = /^\d{4}-\d{2}-\d{2}$/.test(draft.date)
      ? 'Tanggal tidak valid atau toko tutup pada hari tersebut.'
      : 'Pilih tanggal yang valid.';
  } else if (draft.date < current.date) {
    errors.date = 'Tanggal reservasi tidak boleh berada di masa lalu.';
  }

  if (!draft.time) errors.time = 'Jam kedatangan wajib dipilih.';
  else if (!/^\d{2}:\d{2}$/.test(draft.time)) {
    errors.time = 'Pilih jam kedatangan yang valid.';
  } else if (Number(draft.time.slice(0, 2)) > 23 || Number(draft.time.slice(3, 5)) > 59) {
    errors.time = 'Pilih jam kedatangan yang valid.';
  } else if (!errors.date) {
    const hours = getOperatingHours(draft.date);
    const duration = getDurationMinutes(draft.service);
    if (!hours || !duration) {
      errors.time = 'Pilih layanan dan tanggal untuk melihat jam yang dapat diajukan.';
    } else {
      const [hour, minute] = draft.time.split(':').map(Number);
      const start = hour * 60 + minute;
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);
      const opening = openHour * 60 + openMinute;
      const closing = closeHour * 60 + closeMinute;
      if (start < opening || start + duration > closing) {
        errors.time = `Jam harus berada dalam operasional dan menyisakan ${duration} menit sebelum toko tutup.`;
      } else if (draft.date === current.date && draft.time <= current.time) {
        errors.time = 'Jam kedatangan tidak boleh berada di waktu yang sudah lewat.';
      }
    }
  }

  if (draft.barber && !businessConfig.barbers.includes(draft.barber)) {
    errors.barber = 'Pilihan barber tidak tersedia.';
  }
  if (draft.notes.length > reservationLimits.notes) {
    errors.notes = `Catatan maksimal ${reservationLimits.notes} karakter.`;
  }
  return errors;
}

export function formatReservationDate(date: string): string {
  if (!getOperatingHours(date)) return date;
  const value = new Date(`${date}T12:00:00+07:00`);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: businessConfig.timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value);
}
