import { AlertCircle, CalendarDays, Clock3, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ReservationForm } from '../components/reservation/ReservationForm';
import { ReservationSummary } from '../components/reservation/ReservationSummary';
import { businessConfig } from '../data/businessConfig';
import type { ReservationDraft, ReservationErrors, ReservationField } from '../types/reservation';
import { validateReservation } from '../utils/reservation';
import { createReservationWhatsAppUrl } from '../utils/whatsapp';

const initialReservation: ReservationDraft = {
  name: '',
  phone: '',
  service: '',
  date: '',
  time: '',
  barber: '',
  notes: '',
};

export function ReservationPage() {
  const [reservation, setReservation] = useState(initialReservation);
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [status, setStatus] = useState('');

  function updateReservation(field: ReservationField, value: string) {
    setReservation((current) => ({
      ...current,
      [field]: value,
      ...(field === 'date' || field === 'service' ? { time: '' } : {}),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      if (field === 'date' || field === 'service') delete next.time;
      return next;
    });
    setStatus('');
  }

  function reviewReservation() {
    const validationErrors = validateReservation(reservation);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setStatus('');
    setShowSummary(true);
  }

  function sendReservation() {
    const validationErrors = validateReservation(reservation);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setShowSummary(false);
      setStatus('Data reservasi tidak lagi valid. Periksa dan lengkapi formulir kembali.');
      return;
    }

    const url = createReservationWhatsAppUrl(businessConfig.adminWhatsApp, reservation);
    if (!url) {
      setStatus('Nomor WhatsApp admin belum tersedia atau formatnya belum valid. Pengajuan belum dikirim; silakan hubungi admin melalui kontak resmi Bone Barber Shop.');
      return;
    }

    try {
      const whatsappWindow = window.open(url, '_blank');
      if (!whatsappWindow) {
        setStatus('Browser memblokir jendela WhatsApp. Izinkan pop-up lalu coba lagi; pengajuan belum dikirim.');
      } else {
        whatsappWindow.opener = null;
        setStatus('');
      }
    } catch {
      setStatus('WhatsApp tidak dapat dibuka. Periksa pengaturan browser atau buka kembali tautan pengajuan.');
    }
  }

  return (
    <main className="page-main section-pad">
      <div className="container reservation-layout">
        <div className="page-intro reservation-intro">
          <div className="section-eyebrow"><CalendarDays size={14} /> RESERVASI</div>
          <h1>Atur waktu.<br /><em>Tunggu konfirmasi.</em></h1>
          <p>Ajukan waktu kunjungan pilihan Anda. Admin akan memeriksa ketersediaan dan mengonfirmasi melalui WhatsApp.</p>
          <div className="reservation-hours"><Clock3 size={17} /><span><b>Jam operasional</b><br />{businessConfig.openingHoursLabel}</span></div>
          <div className="reservation-privacy"><ShieldCheck size={17} /><span>Detail hanya diteruskan melalui WhatsApp saat Anda memilih mengirim permintaan. Situs ini tidak menyimpan data reservasi.</span></div>
        </div>

        <div className="reservation-panel">
          <div className="reservation-confirmation-note" role="note">
            <AlertCircle size={17} />
            <span>Permintaan reservasi belum otomatis diterima. Jadwal menunggu konfirmasi admin melalui WhatsApp dan pilihan jam bukan jaminan slot tersedia.</span>
          </div>
          {showSummary
            ? <ReservationSummary reservation={reservation} status={status} onEdit={() => { setShowSummary(false); setStatus(''); }} onSend={sendReservation} />
            : <ReservationForm value={reservation} errors={errors} status={status} onChange={updateReservation} onSubmit={reviewReservation} />}
          <p className="reservation-data-note">Data nama, nomor WhatsApp, layanan, tanggal, jam, barber, dan catatan akan disertakan dalam pesan WhatsApp apabila Anda memilih mengirim. Pastikan informasi sudah benar.</p>
        </div>
      </div>
    </main>
  );
}
