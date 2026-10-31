import { ExternalLink, MapPin } from 'lucide-react';
import { DistanceCalculator } from '../components/DistanceCalculator';
import { shop } from '../data/shop';

export function LocationPage() {
  return (
    <main className="page-main section-pad">
      <div className="container">
        <div className="page-intro centered-intro">
          <div className="section-eyebrow"><MapPin size={14} /> TEMUKAN KAMI</div>
          <h1>Singgah untuk<br /><em>potongan terbaik.</em></h1>
          <p>Kami menantikan kunjunganmu ke Bone Barber Shop di Cirebon.</p>
        </div>
        <div className="location-grid">
          <section className="location-card">
            <div className="location-visual"><span className="map-pin-large"><MapPin size={25} /></span><span className="location-coordinate-label">BONE BARBER SHOP · CIREBON</span><div className="map-grid-lines" /></div>
            <div className="location-details"><div className="section-eyebrow">ALAMAT KAMI</div><h2>{shop.name}</h2><p>{shop.address}</p><a className="button button-outline" href={shop.mapsUrl} target="_blank" rel="noreferrer">Buka lokasi di Google Maps <ExternalLink size={15} /></a></div>
          </section>
          <DistanceCalculator />
        </div>
      </div>
    </main>
  );
}
