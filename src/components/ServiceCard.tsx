import { ArrowUpRight, Check } from 'lucide-react';
import type { Service } from '../data/shop';

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article className="service-card">
      <div className="service-card-top"><span className="service-number">0{index + 1}</span><span className="service-icon"><Check size={17} /></span></div>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="service-price"><span>Harga acuan · konfirmasi admin</span><strong>{service.price}</strong></div>
      <p className="service-duration">Durasi pada data sistem: {service.duration}</p>
      <ArrowUpRight className="service-arrow" size={18} />
    </article>
  );
}
