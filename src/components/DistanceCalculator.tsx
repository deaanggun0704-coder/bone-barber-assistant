import { ExternalLink, LocateFixed, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { shop, type Coordinate } from '../data/shop';
import { haversineDistanceKm } from '../utils/distance';

type InputFieldProps = { label: string; value: string; onChange: (value: string) => void };
function CoordinateField({ label, value, onChange }: InputFieldProps) {
  return <label className="field-label">{label}<input type="number" step="any" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Contoh: -6.70" /></label>;
}

export function DistanceCalculator() {
  const [permissionMessage, setPermissionMessage] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  function calculate(origin: Coordinate) {
    if (!shop.coordinates) {
      setResult(null);
      setPermissionMessage('Koordinat Bone Barber Shop belum diverifikasi admin. Kalkulasi jarak belum tersedia.');
      return;
    }
    try {
      setResult(haversineDistanceKm(origin, shop.coordinates));
      setPermissionMessage('');
    } catch {
      setResult(null);
      setPermissionMessage('Koordinat tidak valid. Periksa kembali latitude dan longitude.');
    }
  }

  function requestLocation() {
    setResult(null);
    if (!shop.coordinates) {
      setPermissionMessage('Koordinat Bone Barber Shop belum diverifikasi admin. Kalkulasi jarak belum tersedia, jadi lokasi Anda tidak diperlukan.');
      return;
    }
    if (!navigator.geolocation) {
      setPermissionMessage('Browser ini tidak mendukung fitur lokasi. Anda dapat memasukkan koordinat secara manual.');
      return;
    }
    setPermissionMessage('Meminta izin lokasi dari browser…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        calculate({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Izinkan akses lokasi di pengaturan browser atau masukkan koordinat secara manual.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Lokasi tidak tersedia. Coba lagi atau masukkan koordinat secara manual.'
            : 'Permintaan lokasi melewati batas waktu. Coba lagi atau masukkan koordinat secara manual.';
        setPermissionMessage(message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  }

  function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (!manualLat.trim() || !manualLon.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setResult(null);
      setPermissionMessage('Masukkan latitude (-90 sampai 90) dan longitude (-180 sampai 180) yang valid.');
      return;
    }
    calculate({ lat, lon });
  }

  return (
    <section className="distance-card">
      <div className="section-eyebrow"><Navigation size={14} /> HITUNG JARAK</div>
      <h2>Seberapa jauh dari Anda?</h2>
      <p className="muted">Pilih lokasi saat ini atau masukkan koordinat. Lokasi hanya digunakan di browser untuk perhitungan ini.</p>
      <button className="button button-outline location-button" type="button" onClick={requestLocation}><LocateFixed size={17} /> Izinkan Lokasi</button>
      <div className="or-divider"><span>atau masukkan koordinat</span></div>
      <form className="coordinates-form" onSubmit={submitManual}>
        <CoordinateField label="Latitude" value={manualLat} onChange={setManualLat} />
        <CoordinateField label="Longitude" value={manualLon} onChange={setManualLon} />
        <button className="button button-gold calculate-button" type="submit">Hitung jarak</button>
      </form>
      {permissionMessage && <p className="status-message" role="status">{permissionMessage}</p>}
      {result !== null && <div className="distance-result" role="status"><span>Jarak garis lurus</span><strong>{result.toFixed(2)} <small>km</small></strong></div>}
      <div className="destination-row"><MapPin size={16} /><span><b>Tujuan</b><br />{shop.address}</span></div>
      <p className="distance-note">Jarak garis lurus berbeda dengan jarak perjalanan melalui jalan. Alamat teks belum dapat digunakan untuk kalkulasi; diperlukan koordinat.</p>
      <a className="map-link" href={shop.mapsUrl} target="_blank" rel="noreferrer">Lihat lokasi di Google Maps <ExternalLink size={15} /></a>
    </section>
  );
}
