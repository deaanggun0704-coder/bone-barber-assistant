import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Scissors, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { shop } from '../data/shop';

type PublicService = { id: number; name: string; price: number; duration: number };
type ApiResponse<T> = { ok: boolean; data?: T; message?: string; bookingCode?: string };
type DateChoice = 'today' | 'tomorrow' | 'other';

const apiUrl = import.meta.env.VITE_BOOKING_API_URL?.trim() ?? '';

function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function priceLabel(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export function ReservationPage() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [dateChoice, setDateChoice] = useState<DateChoice>('today');
  const [otherDate, setOtherDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const today = useMemo(() => localDateValue(new Date()), []);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return localDateValue(date);
  }, []);
  const bookingDate = dateChoice === 'today' ? today : dateChoice === 'tomorrow' ? tomorrow : otherDate;
  const selectedDay = bookingDate ? new Date(`${bookingDate}T12:00:00`).getDay() : -1;
  const opensAt = selectedDay === 0 ? '10:00' : '09:00';
  const selectedServiceData = services.find((service) => String(service.id) === selectedService);
  const maxStartTime = useMemo(() => {
    if (!selectedServiceData) return '19:45';
    const closing = new Date(2000, 0, 1, 20, 0);
    closing.setMinutes(closing.getMinutes() - selectedServiceData.duration);
    return `${String(closing.getHours()).padStart(2, '0')}:${String(closing.getMinutes()).padStart(2, '0')}`;
  }, [selectedDay, selectedServiceData]);

  useEffect(() => {
    if (!apiUrl) return;
    const controller = new AbortController();
    setServicesLoading(true);
    fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=services`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as ApiResponse<PublicService[]>;
        if (!response.ok || !result.ok || !result.data) throw new Error(result.message || 'Daftar layanan tidak dapat dimuat.');
        setServices(result.data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const message = error instanceof TypeError
          ? 'Tidak dapat terhubung ke server booking admin. Periksa URL HTTPS server dan izin CORS.'
          : error instanceof Error ? error.message : 'Daftar layanan tidak dapat dimuat. Silakan coba lagi.';
        setStatus({ kind: 'error', text: message });
      })
      .finally(() => setServicesLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (time && (time < opensAt || time > maxStartTime)) setTime('');
  }, [opensAt, maxStartTime, time]);

  function chooseDate(choice: DateChoice) {
    setDateChoice(choice);
    setStatus(null);
    if (choice !== 'other') setOtherDate('');
    setTime('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    if (!apiUrl) {
      setStatus({ kind: 'error', text: 'Reservasi online belum terhubung ke server admin. Silakan hubungi admin melalui kontak resmi barbershop.' });
      return;
    }
    if (!selectedServiceData || !bookingDate || !time || !consent) {
      setStatus({ kind: 'error', text: 'Lengkapi nama, nomor HP/WhatsApp, layanan, tanggal, jam, dan persetujuan terlebih dahulu.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          serviceId: selectedServiceData.id,
          date: bookingDate,
          time,
          consent,
          website,
        }),
      });
      const result = await response.json() as ApiResponse<null>;
      if (!response.ok || !result.ok) throw new Error(result.message || 'Permintaan reservasi tidak berhasil dikirim.');
      setStatus({
        kind: 'success',
        text: `Permintaan reservasi${result.bookingCode ? ` ${result.bookingCode}` : ''} sudah diterima dan menunggu konfirmasi admin/kasir. Jadwal belum dianggap pasti sampai dikonfirmasi.`,
      });
      setName('');
      setPhone('');
      setSelectedService('');
      setTime('');
      setConsent(false);
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Tidak dapat terhubung ke server booking admin. Permintaan belum tersimpan; silakan coba lagi atau hubungi admin.'
        : error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim reservasi. Silakan coba lagi.';
      setStatus({ kind: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-main section-pad">
      <div className="container reservation-layout">
        <div className="page-intro reservation-intro">
          <div className="section-eyebrow"><CalendarDays size={14} /> RESERVASI</div>
          <h1>Atur waktu.<br /><em>Kami siapkan kursi.</em></h1>
          <p>Ajukan waktu kunjungan pilihan Anda. Admin/kasir akan memeriksa ketersediaan dan mengonfirmasi melalui nomor WhatsApp/HP.</p>
          <div className="reservation-hours"><Clock3 size={17} /><span><b>Jam operasional</b><br />{shop.openingHours}</span></div>
          <div className="reservation-privacy"><ShieldCheck size={17} /><span>Nama dan nomor kontak hanya digunakan untuk memproses dan mengonfirmasi permintaan reservasi.</span></div>
        </div>

        <form className="reservation-card" onSubmit={submit}>
          <div className="reservation-card-heading">
            <span className="reservation-icon"><Scissors size={19} /></span>
            <span><strong>Ajukan reservasi</strong><small>Lengkapi detail kunjungan Anda</small></span>
          </div>

          {!apiUrl && (
            <div className="reservation-notice" role="status">
              <AlertCircle size={17} />
              <span>Server booking admin belum terhubung ke situs publik. Form ini belum dapat mengirim atau menyimpan permintaan secara online.</span>
            </div>
          )}
          {status && <div className={`reservation-status ${status.kind}`} role="status">{status.kind === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}<span>{status.text}</span></div>}

          <label className="reservation-field">Nama lengkap
            <input name="name" autoComplete="name" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama Anda" />
          </label>
          <label className="sr-only" aria-hidden="true">Jangan isi kolom ini
            <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
          <label className="reservation-field">Nomor WhatsApp / HP
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} minLength={8} required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Contoh: 08xxxxxxxxxx" />
          </label>

          <fieldset className="reservation-fieldset">
            <legend>Pilih hari</legend>
            <div className="date-choice-list">
              <button type="button" className={`date-choice ${dateChoice === 'today' ? 'selected' : ''}`} onClick={() => chooseDate('today')}><small>HARI INI</small><strong>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date())}</strong></button>
              <button type="button" className={`date-choice ${dateChoice === 'tomorrow' ? 'selected' : ''}`} onClick={() => chooseDate('tomorrow')}><small>BESOK</small><strong>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(Date.now() + 86400000))}</strong></button>
              <button type="button" className={`date-choice ${dateChoice === 'other' ? 'selected' : ''}`} onClick={() => chooseDate('other')}><small>PILIH</small><strong>Hari lain</strong></button>
            </div>
            {dateChoice === 'other' && <input className="other-date-input" aria-label="Pilih tanggal reservasi" type="date" min={today} required value={otherDate} onChange={(event) => { setOtherDate(event.target.value); setTime(''); }} />}
          </fieldset>

          <label className="reservation-field">Layanan
            <select required disabled={!apiUrl || servicesLoading || services.length === 0} value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
              <option value="">{servicesLoading ? 'Memuat layanan…' : services.length ? 'Pilih layanan' : 'Layanan belum tersedia'}</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {priceLabel(service.price)}</option>)}
            </select>
          </label>

          <label className="reservation-field">Jam reservasi
            <input type="time" required min={opensAt} max={maxStartTime} step={900} value={time} onChange={(event) => setTime(event.target.value)} />
            <small className="field-hint">Jam buka {selectedDay === 0 ? 'Minggu' : 'Senin–Sabtu'} {opensAt.replace(':', '.')}–20.00. Waktu akhir layanan harus sebelum toko tutup; jadwal tetap menunggu konfirmasi admin.</small>
          </label>

          <label className="reservation-consent">
            <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>Saya setuju nama, nomor kontak, layanan, dan waktu pilihan dikirim ke sistem admin untuk memproses serta mengonfirmasi reservasi.</span>
          </label>

          <button className="button button-gold reservation-submit" type="submit" disabled={submitting || servicesLoading || !apiUrl || services.length === 0}>
            {submitting ? 'Mengirim permintaan…' : 'Kirim permintaan reservasi'}
          </button>
          <p className="reservation-pending-note">Permintaan akan berstatus menunggu. Reservasi belum terkonfirmasi sampai admin/kasir memeriksa ketersediaan dan menghubungi Anda.</p>
        </form>
      </div>
    </main>
  );
}
