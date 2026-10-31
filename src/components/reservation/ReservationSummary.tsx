import { ArrowLeft, CalendarDays, Clock3, MessageCircle, Scissors, UserRound } from 'lucide-react';
import type { ReservationDraft } from '../../types/reservation';
import { formatReservationDate } from '../../utils/reservation';

type Props = {
  reservation: ReservationDraft;
  status: string;
  onEdit: () => void;
  onSend: () => void;
};

export function ReservationSummary({ reservation, status, onEdit, onSend }: Props) {
  return (
    <section className="reservation-card reservation-summary" aria-labelledby="reservation-summary-title">
      <div className="reservation-card-heading">
        <span className="reservation-icon"><CalendarDays size={19} /></span>
        <span><strong id="reservation-summary-title">Ringkasan reservasi</strong><small>Periksa kembali sebelum mengirim ke admin</small></span>
      </div>
      <dl className="reservation-summary-list">
        <div><dt>Nama pelanggan</dt><dd>{reservation.name.trim()}</dd></div>
        <div><dt>Nomor WhatsApp</dt><dd>{reservation.phone.trim() || 'Tidak dicantumkan'}</dd></div>
        <div><dt><Scissors size={14} /> Layanan</dt><dd>{reservation.service}</dd></div>
        <div><dt><CalendarDays size={14} /> Tanggal</dt><dd>{formatReservationDate(reservation.date)}</dd></div>
        <div><dt><Clock3 size={14} /> Jam</dt><dd>{reservation.time} WIB</dd></div>
        {reservation.barber && <div><dt><UserRound size={14} /> Barber</dt><dd>{reservation.barber}</dd></div>}
        <div><dt>Catatan</dt><dd className="reservation-summary-notes">{reservation.notes.trim() || 'Tidak ada catatan'}</dd></div>
      </dl>
      {status && <div className="reservation-notice" role="alert"><MessageCircle size={17} /><span>{status}</span></div>}
      <div className="reservation-summary-actions">
        <button className="button button-outline" type="button" onClick={onEdit}><ArrowLeft size={16} /> Ubah Reservasi</button>
        <button className="button button-gold" type="button" onClick={onSend}><MessageCircle size={16} /> Kirim Permintaan via WhatsApp</button>
      </div>
      <p className="reservation-pending-note">Dengan memilih kirim, detail di atas akan diteruskan melalui WhatsApp. Permintaan belum otomatis diterima dan perlu konfirmasi admin.</p>
    </section>
  );
}
