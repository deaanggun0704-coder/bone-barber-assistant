import { CalendarDays, Clock3, MessageCircle, Scissors, UserRound } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { businessConfig } from '../../data/businessConfig';
import type { ReservationDraft, ReservationErrors, ReservationField } from '../../types/reservation';
import { getAvailableReservationTimes, getJakartaDateTime, reservationLimits } from '../../utils/reservation';

type Props = {
  value: ReservationDraft;
  errors: ReservationErrors;
  status: string;
  onChange: (field: ReservationField, value: string) => void;
  onSubmit: () => void;
};

export function ReservationForm({ value, errors, status, onChange, onSubmit }: Props) {
  const today = getJakartaDateTime().date;
  const availableTimes = getAvailableReservationTimes(value.date, value.service);

  function update(field: ReservationField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      onChange(field, event.target.value);
    };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function error(field: ReservationField) {
    const message = errors[field];
    return message ? <span className="reservation-error" id={`reservation-${field}-error`}>{message}</span> : null;
  }

  return (
    <form className="reservation-card" onSubmit={submit} noValidate>
      <div className="reservation-card-heading">
        <span className="reservation-icon"><Scissors size={19} /></span>
        <span><strong>Ajukan reservasi</strong><small>Lengkapi detail kunjungan Anda</small></span>
      </div>
      {status && <div className="reservation-notice" role="status"><MessageCircle size={17} /><span>{status}</span></div>}

      <label className="reservation-field" htmlFor="reservation-name">Nama pelanggan <span aria-hidden="true">*</span>
        <input id="reservation-name" name="name" autoComplete="name" maxLength={reservationLimits.name} required value={value.name} onChange={update('name')} placeholder="Nama Anda" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'reservation-name-error' : undefined} />
        {error('name')}
      </label>

      <label className="reservation-field" htmlFor="reservation-phone">Nomor WhatsApp pelanggan <span className="optional-label">(opsional)</span>
        <input id="reservation-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={reservationLimits.phone} value={value.phone} onChange={update('phone')} placeholder="Contoh: 081234567890" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'reservation-phone-error' : undefined} />
        {error('phone')}
      </label>

      <label className="reservation-field" htmlFor="reservation-service"><span className="reservation-label-icon"><Scissors size={14} /> Layanan <span aria-hidden="true">*</span></span>
        <select id="reservation-service" required value={value.service} onChange={update('service')} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'reservation-service-error' : undefined}>
          <option value="">Pilih layanan</option>
          {businessConfig.services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}
        </select>
        {error('service')}
      </label>

      <label className="reservation-field" htmlFor="reservation-date"><span className="reservation-label-icon"><CalendarDays size={14} /> Tanggal reservasi <span aria-hidden="true">*</span></span>
        <input id="reservation-date" type="date" min={today} required value={value.date} onChange={update('date')} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'reservation-date-error' : undefined} />
        {error('date')}
      </label>

      <label className="reservation-field" htmlFor="reservation-time"><span className="reservation-label-icon"><Clock3 size={14} /> Jam kedatangan <span aria-hidden="true">*</span></span>
        <select id="reservation-time" required value={value.time} onChange={update('time')} disabled={!value.date || !value.service || availableTimes.length === 0} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? 'reservation-time-error' : undefined}>
          <option value="">Pilih jam</option>
          {availableTimes.map((time) => <option key={time} value={time}>{time}</option>)}
        </select>
        {value.date && value.service && availableTimes.length === 0 && <span className="field-hint">Tidak ada jam pengajuan yang tersisa pada tanggal tersebut berdasarkan jam operasional dan durasi layanan.</span>}
        {error('time')}
        <span className="field-hint">Jam yang dipilih adalah permintaan dan belum memastikan ketersediaan. Admin akan mengonfirmasi melalui WhatsApp.</span>
      </label>

      {businessConfig.barbers.length > 0 && (
        <label className="reservation-field" htmlFor="reservation-barber"><span className="reservation-label-icon"><UserRound size={14} /> Barber <span className="optional-label">(opsional)</span></span>
          <select id="reservation-barber" value={value.barber} onChange={update('barber')} aria-invalid={Boolean(errors.barber)} aria-describedby={errors.barber ? 'reservation-barber-error' : undefined}>
            <option value="">Tidak ada pilihan</option>
            {businessConfig.barbers.map((barber) => <option key={barber} value={barber}>{barber}</option>)}
          </select>
          {error('barber')}
        </label>
      )}

      <label className="reservation-field" htmlFor="reservation-notes">Catatan tambahan <span className="optional-label">(opsional)</span>
        <textarea id="reservation-notes" rows={3} maxLength={reservationLimits.notes} value={value.notes} onChange={update('notes')} placeholder="Contoh: preferensi gaya rambut" aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'reservation-notes-error' : 'reservation-notes-count'} />
        <span className="field-hint" id="reservation-notes-count">{value.notes.length}/{reservationLimits.notes} karakter</span>
        {error('notes')}
      </label>

      {Object.keys(errors).length > 0 && <p className="reservation-error-summary" role="alert">Periksa kembali data yang ditandai sebelum melanjutkan.</p>}
      <button className="button button-gold reservation-submit" type="submit">Lihat Ringkasan <span aria-hidden="true">→</span></button>
      <p className="reservation-pending-note">Permintaan belum otomatis diterima. Admin perlu memeriksa jadwal dan mengonfirmasi melalui WhatsApp.</p>
    </form>
  );
}
