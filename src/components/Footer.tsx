import { MapPin, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../data/shop';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to="/" className="brand footer-brand">
          <span className="brand-mark"><Scissors size={18} /></span>
          <span><strong>BONE</strong><small>BARBER SHOP · CIREBON</small></span>
        </Link>
        <p><MapPin size={14} /> {shop.address}</p>
        <span className="footer-note">© {new Date().getFullYear()} Bone Barber Assistant</span>
      </div>
    </footer>
  );
}
