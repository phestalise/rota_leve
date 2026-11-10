import { Platform } from 'react-native';

/**
 * Design system do Rota Leve.
 * Paleta "papel + verde-petróleo" com coral como acento: calma, legível e acolhedora.
 */
export const colors = {
  // superfícies
  bg: '#F5F2EC',
  surface: '#FFFFFF',
  surfaceAlt: '#EEE9E0',
  line: '#E5DFD4',

  // texto
  ink: '#16211E',
  inkSoft: '#5A6662',
  inkFaint: '#98A19D',

  // marca
  brand: '#0E6B5C',
  brandDark: '#0A4F44',
  brandSoft: '#DCEEE8',
  accent: '#FF7A59',
  accentSoft: '#FFE7DF',

  // estados
  good: '#1D8A57',
  goodSoft: '#DFF2E7',
  warn: '#B9770E',
  warnSoft: '#FCF0DA',
  bad: '#CF4339',
  badSoft: '#FBE6E3',

  white: '#FFFFFF',

  // aliases usados em telas antigas/componentes
  primary: '#0E6B5C',
  primaryDark: '#0A4F44',
  primaryLight: '#DCEEE8',
  background: '#F5F2EC',
  text: '#16211E',
  textMuted: '#5A6662',
  border: '#E5DFD4',
  danger: '#CF4339',
  dangerLight: '#FBE6E3',
  warning: '#B9770E',
  warningLight: '#FCF0DA',
  success: '#1D8A57',
  successLight: '#DFF2E7',
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(22,33,30,0.04), 0 6px 20px rgba(22,33,30,0.06)' } as object,
  default: {
    shadowColor: '#16211E',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
});

export const shadowStrong = Platform.select({
  web: { boxShadow: '0 2px 4px rgba(22,33,30,0.05), 0 16px 36px rgba(14,107,92,0.16)' } as object,
  default: {
    shadowColor: '#0E6B5C',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});

export type Tone = 'brand' | 'good' | 'warn' | 'bad' | 'neutral' | 'accent';

export function toneColors(tone: Tone) {
  switch (tone) {
    case 'good':
      return { fg: colors.good, bg: colors.goodSoft };
    case 'warn':
      return { fg: colors.warn, bg: colors.warnSoft };
    case 'bad':
      return { fg: colors.bad, bg: colors.badSoft };
    case 'accent':
      return { fg: '#C2502F', bg: colors.accentSoft };
    case 'neutral':
      return { fg: colors.inkSoft, bg: colors.surfaceAlt };
    default:
      return { fg: colors.brandDark, bg: colors.brandSoft };
  }
}

export function scoreTone(score: number, blocked = false): Tone {
  if (blocked) return 'bad';
  if (score >= 75) return 'good';
  if (score >= 50) return 'warn';
  return 'bad';
}

export function scoreVerdict(score: number, blocked = false) {
  if (blocked) return 'Inviável para você';
  if (score >= 85) return 'Muito acessível';
  if (score >= 75) return 'Acessível';
  if (score >= 50) return 'Com ressalvas';
  return 'Difícil para você';
}

export function scoreColor(score: number) {
  return toneColors(scoreTone(score));
}
