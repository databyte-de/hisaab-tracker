import { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function getSystemPref(): Resolved {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStored(): Mode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* ignore */
  }
  return 'auto';
}

function applyTheme(theme: Resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#15120f' : '#f8f5f0');
}

export function useTheme() {
  const [mode, setMode] = useState<Mode>(() => getStored());
  const [resolved, setResolved] = useState<Resolved>(() => {
    const m = getStored();
    return m === 'auto' ? getSystemPref() : m;
  });

  useEffect(() => {
    setResolved(mode === 'auto' ? getSystemPref() : mode);
  }, [mode]);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const cycle = () => {
    const next: Mode = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setMode(next);
  };

  return { mode, resolved, cycle };
}
