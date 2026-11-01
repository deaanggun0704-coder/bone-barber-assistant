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
          <p>Daftar layanan berdasarkan data bawaan situs operasional Bone Barber Shop.</p>
        </div>
        <div className="service-grid page-service-grid">{shop.services.map((service, index) => <ServiceCard key={service.name} service={service} index={index} />)}</div>
        <p className="admin-note">Harga dan durasi di atas berasal dari data bawaan situs operasional dan belum dikonfirmasi sebagai harga terbaru. Silakan hubungi admin sebelum berkunjung.</p>
        <section className="product-section">
          <div className="product-section-heading">
            <div className="section-eyebrow">PRODUK RETAIL</div>
            <h2>Perawatan untuk di rumah.</h2>
            <p>Produk, harga jual, dan stok berdasarkan wawancara langsung.</p>
          </div>
          <div className="product-category-grid">
            {shop.products.map((product, index) => (
              <article className="product-category-card" key={product.name}>
                <span className="service-number">0{index + 1}</span>
                <h3>{product.name}</h3>
                <p>{product.price} · Stok {product.stock} {product.unit}</p>
              </article>
            ))}
          </div>
          <p className="admin-note">Stok dapat berubah mengikuti penjualan. Hubungi admin untuk memastikan ketersediaan terbaru.</p>
        </section>
      </div>
    </main>
  );
}
