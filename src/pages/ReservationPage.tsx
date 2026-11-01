import { AlertCircle, CalendarDays, Clock3, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReservationForm } from '../components/reservation/ReservationForm';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedService = searchParams.get('service') ?? '';
  const initialService = businessConfig.services.some((service) => service.name === requestedService) ? requestedService : '';
  const [reservation, setReservation] = useState({ ...initialReservation, service: initialService });
  const [errors, setErrors] = useState<ReservationErrors>({});
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

  function submitReservation() {
    const validationErrors = validateReservation(reservation);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStatus('Periksa dan lengkapi data reservasi yang ditandai sebelum membuka WhatsApp.');
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
        setStatus('Browser memblokir WhatsApp. Izinkan pop-up lalu kirim kembali formulir; chatbot belum dapat mengonfirmasi draf WhatsApp terbuka.');
        return;
      }
      whatsappWindow.opener = null;
      navigate('/chat?reservation=prepared');
    } catch {
      setStatus('WhatsApp tidak dapat dibuka. Periksa pengaturan browser lalu coba kembali.');
    }
  }

  return (
    <main className="page-main section-pad">
      <div className="container reservation-layout">
        <div className="page-intro reservation-intro">
          <div className="section-eyebrow"><CalendarDays size={14} /> RESERVASI</div>
          <h1>Atur waktu.<br /><em>Tunggu konfirmasi.</em></h1>
          <p>Isi nama, nomor WhatsApp, layanan, tanggal, dan jam kunjungan. Setelah formulir valid, WhatsApp terbuka dan chatbot mengonfirmasi bahwa draf reservasi sudah disiapkan.</p>
          <div className="reservation-hours"><Clock3 size={17} /><span><b>Jam operasional</b><br />{businessConfig.openingHoursLabel}</span></div>
          <div className="reservation-privacy"><ShieldCheck size={17} /><span>Data reservasi tidak disimpan oleh situs. Anda tetap perlu menekan tombol kirim di WhatsApp agar pesan diteruskan kepada admin.</span></div>
        </div>

        <div className="reservation-panel">
          <div className="reservation-confirmation-note" role="note">
            <AlertCircle size={17} />
            <span>Setelah formulir valid, WhatsApp terbuka dan chatbot memberi konfirmasi bahwa draf sudah disiapkan. Pesan tetap perlu dikirim manual; jadwal menunggu konfirmasi admin.</span>
          </div>
          <ReservationForm value={reservation} errors={errors} status={status} onChange={updateReservation} onSubmit={submitReservation} />
          <p className="reservation-data-note">Nama, nomor WhatsApp, layanan, tanggal, jam, barber, dan catatan akan dimasukkan ke draf pesan WhatsApp. Periksa kembali sebelum menekan Kirim.</p>
        </div>
      </div>
    </main>
  );
}
