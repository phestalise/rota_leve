export const colors = {
  primary: '#1B7F6B',
  primaryDark: '#125A4C',
  primaryLight: '#E8F5F0',
  accent: '#F2A541',
  background: '#F6F8F7',
  surface: '#FFFFFF',
  text: '#1D2B28',
  textMuted: '#5E6E6A',
  border: '#D8E1DE',
  danger: '#C8423B',
  dangerLight: '#FCEBEA',
  warning: '#B7791F',
  warningLight: '#FFF6E5',
  success: '#2F855A',
  successLight: '#E6F4EC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export function scoreColor(score: number) {
  if (score >= 75) return { fg: colors.success, bg: colors.successLight };
  if (score >= 50) return { fg: colors.warning, bg: colors.warningLight };
  return { fg: colors.danger, bg: colors.dangerLight };
}
