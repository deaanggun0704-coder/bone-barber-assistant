import { ArrowDownRight, ArrowRight, BadgeCheck, Clock3, MapPin, MessageCircle, Scissors, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../data/shop';
import { ServiceCard } from '../components/ServiceCard';

export function HomePage() {
  return (
    <>
      <main>
        <section className="hero-section">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEIGHBORHOOD BARBER, REIMAGINED</div>
              <h1>Good hair.<br /><em>Good day.</em></h1>
              <p className="hero-description">Semua informasi Bone Barber Shop, sekarang lebih mudah dijangkau. Tanya apa saja seputar layanan, harga, dan kunjunganmu.</p>
              <div className="hero-actions"><Link className="button button-gold" to="/chat">Mulai Chat <ArrowRight size={17} /></Link><Link className="button button-quiet" to="/layanan">Jelajahi layanan <ArrowDownRight size={16} /></Link></div>
              <div className="hero-proof"><span className="proof-icon"><BadgeCheck size={16} /></span><span>Informasi terpusat, jawaban transparan</span></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-frame">
                <div className="hero-photo">
                  <div className="photo-grain" />
                  <Scissors className="scissors-watermark" size={102} strokeWidth={0.75} />
                  <span className="photo-caption">THE CRAFT OF A GOOD CUT</span>
                </div>
                <div className="visual-label"><span className="label-dot" /> CIREBON, JAWA BARAT</div>
              </div>
              <div className="hero-floating-card"><span className="floating-icon"><MessageCircle size={17} /></span><span><strong>Butuh info?</strong><small>Asisten kami siap membantu</small></span></div>
              <div className="hero-decoration">B.</div>
            </div>
          </div>
          <div className="hero-bottom-line" />
        </section>

        <section className="container info-strip" aria-label="Informasi barbershop">
          <div className="info-item"><span className="info-icon"><MapPin size={18} /></span><span><small>KUNJUNGI KAMI</small><strong>Bone Barber Shop · Cirebon</strong></span></div>
          <div className="info-item"><span className="info-icon"><Clock3 size={18} /></span><span><small>JAM OPERASIONAL</small><strong>{shop.openingHours}</strong></span></div>
          <div className="info-item info-action"><Link to="/lokasi">Temukan lokasi <ArrowRight size={15} /></Link></div>
        </section>

        <section className="section-pad intro-section">
          <div className="container intro-grid">
            <div><div className="section-eyebrow"><Sparkles size={14} /> KENALAN DENGAN ASISTEN</div><h2>Lebih sedikit menunggu.<br /><span>Lebih banyak tahu.</span></h2></div>
            <div className="intro-copy"><p>Butuh info sebelum mampir? Bone Barber Assistant membantu menjawab pertanyaan tentang barbershop kami—tanpa mencari ke mana-mana.</p><Link className="text-link" to="/tentang">Kenali Bone Barber Assistant <ArrowRight size={15} /></Link></div>
          </div>
          <div className="container feature-grid">
            <article className="feature-card"><span>01</span><MessageCircle /><h3>Info dalam satu chat</h3><p>Tanyakan layanan, harga, jam buka, dan reservasi melalui percakapan sederhana.</p></article>
            <article className="feature-card"><span>02</span><BadgeCheck /><h3>Jawaban yang jujur</h3><p>Detail yang belum dikonfirmasi ditandai dengan jelas. Tidak ada harga atau jadwal karangan.</p></article>
            <article className="feature-card"><span>03</span><MapPin /><h3>Lebih mudah menemukan</h3><p>Lihat alamat, buka Google Maps, atau hitung jarak setelah koordinat toko diverifikasi.</p></article>
          </div>
        </section>

        <section className="section-pad services-preview">
          <div className="container">
            <div className="section-heading"><div><div className="section-eyebrow"><Scissors size={14} /> APA YANG KAMI TAWARKAN</div><h2>Perawatan yang pas.<br /><span>Tanpa basa-basi.</span></h2></div><Link className="button button-outline" to="/layanan">Semua layanan <ArrowRight size={16} /></Link></div>
            <div className="service-grid">{shop.services.slice(0, 4).map((service, index) => <ServiceCard key={service.name} service={service} index={index} />)}</div>
          </div>
        </section>

        <section className="container cta-banner"><div className="cta-pattern" />        <div className="cta-copy"><div className="section-eyebrow"><span className="eyebrow-line" /> NEED A QUICK ANSWER?</div><h2>Mulai dari satu pertanyaan.</h2><p>Asisten Bone siap membantu kapan saja.</p></div><div className="cta-actions"><Link className="button button-dark" to="/chat">Mulai percakapan <ArrowRight size={17} /></Link><Link className="button button-dark" to="/reservasi">Ajukan reservasi <ArrowRight size={17} /></Link></div></section>
      </main>
    </>
  );
}
