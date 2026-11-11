import { Platform, useWindowDimensions } from 'react-native';

/**
 * Design system do Rota Leve.
 * Vermelho como cor de marca, em dois temas: claro (vermelho + branco) e escuro (vermelho + preto).
 * `colors` é um objeto mutável: ao trocar o tema, os valores são substituídos e o app re-renderiza.
 */
export type ThemeMode = 'light' | 'dark';

const light = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  line: '#E6E6E6',

  ink: '#111111',
  inkSoft: '#555555',
  inkFaint: '#999999',

  brand: '#D62839',
  brandDark: '#A51D2C',
  brandSoft: '#FDECEE',
  accent: '#111111',
  accentSoft: '#EEEEEE',

  good: '#15803D',
  goodSoft: '#E3F5EA',
  warn: '#B45309',
  warnSoft: '#FDF1DE',
  bad: '#C81E1E',
  badSoft: '#FDE8E8',

  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)',
};

const dark: typeof light = {
  bg: '#0A0A0A',
  surface: '#151515',
  surfaceAlt: '#212121',
  line: '#2A2A2A',

  ink: '#F5F5F5',
  inkSoft: '#B5B5B5',
  inkFaint: '#7A7A7A',

  brand: '#E63946',
  brandDark: '#FF7A84',
  brandSoft: '#2B1215',
  accent: '#F5F5F5',
  accentSoft: '#262626',

  good: '#4ADE80',
  goodSoft: '#10261A',
  warn: '#FBBF24',
  warnSoft: '#2A210C',
  bad: '#FF6B6B',
  badSoft: '#2E1416',

  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.75)',
};

export const palettes = { light, dark };

function withAliases(p: typeof light) {
  return {
    ...p,
    // aliases usados em componentes antigos
    primary: p.brand,
    primaryDark: p.brandDark,
    primaryLight: p.brandSoft,
    background: p.bg,
    text: p.ink,
    textMuted: p.inkSoft,
    border: p.line,
    danger: p.bad,
    dangerLight: p.badSoft,
    warning: p.warn,
    warningLight: p.warnSoft,
    success: p.good,
    successLight: p.goodSoft,
  };
}

export const colors = withAliases(light);

let themeMode: ThemeMode = 'light';
let themeVersion = 0;

export function getThemeMode() {
  return themeMode;
}

export function applyTheme(mode: ThemeMode) {
  themeMode = mode;
  themeVersion++;
  Object.assign(colors, withAliases(palettes[mode]));
}

/**
 * Cria um objeto de estilos que é recalculado quando o tema muda.
 * Uso: `const styles = themed(() => StyleSheet.create({ ... }))`.
 */
export function themed<T extends object>(factory: () => T): T {
  let cache: T | null = null;
  let version = -1;
  const current = () => {
    if (version !== themeVersion || !cache) {
      cache = factory();
      version = themeVersion;
    }
    return cache;
  };
  return new Proxy({} as T, {
    get: (_t, key) => (current() as Record<string | symbol, unknown>)[key],
    has: (_t, key) => key in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_t, key) => {
      const obj = current() as Record<string | symbol, unknown>;
      if (!(key in obj)) return undefined;
      return { value: obj[key], enumerable: true, configurable: true, writable: false };
    },
  });
}

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

/** Sombra discreta: a separação vem principalmente da borda, não do peso da sombra. */
export const elev = themed(() => ({
  shadow: { ...Platform.select({
  web: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } as object,
  default: {
    shadowColor: '#16211E',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
}), borderWidth: 1, borderColor: colors.line },
  shadowStrong: { ...Platform.select({
  web: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } as object,
  default: {
    shadowColor: '#16211E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
}), borderWidth: 1, borderColor: colors.line },
}));

/* Layout responsivo */
export const CONTENT_MAX_WIDTH = 720;
export const WIDE_BREAKPOINT = 900;

export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}

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
      return { fg: colors.accent, bg: colors.accentSoft };
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
