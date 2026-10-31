import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '../hooks/useTheme';

type Props = {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
};

export function ThemeControl({ theme, onChange }: Props) {
  return (
    <label className="theme-control" aria-label="Pilih tema">
      {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
      <select value={theme} onChange={(event) => onChange(event.target.value as ThemePreference)} aria-label="Tema tampilan">
        <option value="system">Sistem</option>
        <option value="light">Terang</option>
        <option value="dark">Gelap</option>
      </select>
    </label>
  );
}
