import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
const storageKey = 'bone-barber-theme';

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // Theme remains usable when browser storage is unavailable.
  }
  return 'system';
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemePreference>(readPreference);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolved = theme === 'system' ? (systemDark.matches ? 'dark' : 'light') : theme;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
    };

    applyTheme();
    systemDark.addEventListener('change', applyTheme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // The selected theme still applies for this page view.
    }
    return () => systemDark.removeEventListener('change', applyTheme);
  }, [theme]);

  return { theme, setTheme };
}
