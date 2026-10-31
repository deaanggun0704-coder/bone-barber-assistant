import { Menu, Scissors, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { ThemePreference } from '../hooks/useTheme';
import { ThemeControl } from './ThemeControl';

type Props = { theme: ThemePreference; onThemeChange: (theme: ThemePreference) => void };
const links = [
  ['/', 'Beranda'],
  ['/chat', 'Chatbot'],
  ['/layanan', 'Layanan'],
  ['/reservasi', 'Reservasi'],
  ['/lokasi', 'Lokasi'],
  ['/tentang', 'Tentang'],
];

export function Navbar({ theme, onThemeChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Scissors size={19} /></span>
          <span><strong>BONE</strong><small>BARBER SHOP · CIREBON</small></span>
        </NavLink>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Navigasi utama">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {label}
            </NavLink>
          ))}
          <ThemeControl theme={theme} onChange={onThemeChange} />
        </nav>
      </div>
    </header>
  );
}
