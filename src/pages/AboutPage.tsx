import { BadgeInfo, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../data/shop';

export function AboutPage() {
  return (
    <main className="page-main section-pad">
      <div className="container about-layout">
        <div className="page-intro">
          <div className="section-eyebrow"><BadgeInfo size={14} /> TENTANG KAMI</div>
          <h1>Gaya klasik.<br /><em>Cara baru terhubung.</em></h1>
          <p>Bone Barber Shop adalah barbershop di Cirebon. Bone Barber Assistant dibuat untuk membantu pelanggan mengakses informasi usaha dengan lebih mudah.</p>
          <Link className="button button-gold" to="/chat">Tanya asisten <MessageCircle size={16} /></Link>
        </div>
        <div className="about-card">
          <div className="about-card-icon"><ShieldCheck size={20} /></div><h2>Asisten yang fokus</h2>
          <p>Chatbot ini hanya memberikan informasi seputar Bone Barber Shop. Jawaban berasal dari FAQ lokal, bukan pencarian internet atau model generatif.</p>
          <div className="about-divider" />
          <div className="about-detail"><MapPin size={17} /><span><small>ALAMAT</small><strong>{shop.address}</strong></span></div>
          <div className="about-detail"><MessageCircle size={17} /><span><small>KONTAK / WHATSAPP</small><strong>{shop.whatsapp}</strong></span></div>
          <p className="about-admin-note">Informasi operasional yang belum tersedia perlu diisi admin.</p>
        </div>
      </div>
    </main>
  );
}
