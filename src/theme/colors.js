export const colors = {
  // Ana arka plan renkleri
  bgPrimary: '#0b0a18',
  bgSecondary: '#141128',
  bgCard: '#17142e',
  bgCardLight: '#231f43',

  // Accent renkler
  accentPrimary: '#8b5cf6',
  accentSecondary: '#a78bfa',
  accentPink: '#ec4899',
  accentGlow: 'rgba(139, 92, 246, 0.3)',

  // Text renkleri
  textPrimary: '#ffffff',
  textSecondary: '#a9a6c6',
  textMuted: '#6f6b92',

  // Durum renkleri
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',

  // Border
  border: '#2a2549',
  borderLight: '#3a3462',

  // Özel renkler
  imposter: '#ef4444',
  player: '#10b981',
};

// Gradient renk çiftleri - LinearGradient ile kullanılır.
export const gradients = {
  background: ['#1a1238', '#0e0b20', '#08070f'],
  primary: ['#a855f7', '#6d28d9'],
  brand: ['#ec4899', '#8b5cf6', '#6366f1'],
  danger: ['#fb7185', '#dc2626'],
  success: ['#34d399', '#059669'],
  warning: ['#fcd34d', '#f59e0b'],
  info: ['#60a5fa', '#4f46e5'],
  surface: ['#1e1a3a', '#15122b'],
};

// Oyuncu avatarları için sıraya göre gradient.
export const avatarGradients = [
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#db2777'],
  ['#fbbf24', '#ea580c'],
  ['#34d399', '#059669'],
  ['#60a5fa', '#2563eb'],
  ['#f87171', '#dc2626'],
  ['#2dd4bf', '#0d9488'],
  ['#fb923c', '#c2410c'],
];

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

// '#rrggbb' rengine şeffaflık ekler.
export const withAlpha = (hex, alpha) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
