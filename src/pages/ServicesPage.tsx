import { Scissors } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { shop } from '../data/shop';

export function ServicesPage() {
  return (
    <main className="page-main section-pad">
      <div className="container">
        <div className="page-intro centered-intro">
          <div className="section-eyebrow"><Scissors size={14} /> MENU LAYANAN</div>
          <h1>Rapikan gaya.<br /><em>Tunjukkan dirimu.</em></h1>
          <p>Daftar layanan Bone Barber Shop. Informasi yang belum dikonfirmasi admin kami tandai dengan jelas.</p>
        </div>
        <div className="service-grid page-service-grid">{shop.services.map((service, index) => <ServiceCard key={service.name} service={service} index={index} />)}</div>
        <p className="admin-note">Harga dan detail layanan perlu dikonfirmasi admin. Silakan hubungi Bone Barber Shop untuk informasi terkini.</p>
      </div>
    </main>
  );
}
