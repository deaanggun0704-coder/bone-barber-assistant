import { shop } from './shop';

const openingHoursByDay = {
  0: { open: '10:00', close: '20:00' },
  1: { open: '09:00', close: '20:00' },
  2: { open: '09:00', close: '20:00' },
  3: { open: '09:00', close: '20:00' },
  4: { open: '09:00', close: '20:00' },
  5: { open: '09:00', close: '20:00' },
  6: { open: '09:00', close: '20:00' },
} as const;
const closedDays: number[] = [];
const dayOrder = [1, 2, 3, 4, 5, 6, 0];
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatOpeningHours(): string {
  const groups: { days: number[]; hours: string }[] = [];
  for (const day of dayOrder) {
    const hours = closedDays.includes(day)
      ? 'Tutup'
      : `${openingHoursByDay[day as keyof typeof openingHoursByDay].open}–${openingHoursByDay[day as keyof typeof openingHoursByDay].close}`;
    const current = groups[groups.length - 1];
    if (current?.hours === hours) current.days.push(day);
    else groups.push({ days: [day], hours });
  }
  return groups.map(({ days, hours }) => {
    const first = dayNames[days[0]];
    const last = dayNames[days[days.length - 1]];
    const dayRange = days.length > 1 ? `${first}–${last}` : first;
    return `${dayRange}: ${hours.replace(/(\d{2}):(\d{2})/g, '$1.$2')}`;
  }).join('; ');
}

export const businessConfig = {
  adminWhatsApp: '6285720035403',
  timezone: 'Asia/Jakarta',
  closedDays,
  openingHoursByDay,
  openingHoursLabel: formatOpeningHours(),
  services: shop.services,
  barbers: [] as string[],
} as const;
