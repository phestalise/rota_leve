import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Svg, { Circle } from 'react-native-svg';
import { colors, CONTENT_MAX_WIDTH, elev, fonts, radius, scoreTone, spacing, themed, Tone, toneColors } from '../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Tipografia                                                          */
/* ------------------------------------------------------------------ */

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'bodyStrong' | 'caption' | 'overline' | 'label';

const variantStyles = themed((): Record<Variant, TextStyle> => ({
  display: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: colors.ink },
  h1: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, color: colors.ink },
  h2: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2, color: colors.ink },
  title: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.ink },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.inkFaint,
  },
}));

export function T({
  variant = 'body',
  color,
  center,
  style,
  ...props
}: TextProps & { variant?: Variant; color?: string; center?: boolean }) {
  return (
    <Text
      {...props}
      style={[variantStyles[variant], color ? { color } : null, center && { textAlign: 'center' }, style]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function Screen({
  children,
  scroll = true,
  footer,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.screenContent, style]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.screenContent, { flex: 1 }, style]}>{children}</View>
        )}
        {footer ? (
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <View style={styles.footerInner}>{footer}</View>
          </SafeAreaView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Título de página usado nas abas (substitui o cabeçalho da navegação). */
export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Row style={{ justifyContent: 'space-between' }} align="flex-start">
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="h1" style={{ fontSize: 24, lineHeight: 30 }}>
          {title}
        </T>
        {subtitle ? <T variant="body">{subtitle}</T> : null}
      </View>
      {right}
    </Row>
  );
}

/** Centraliza o conteúdo e limita a largura em telas grandes. */
export function Container({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

export function Row({
  children,
  gap = spacing.sm,
  style,
  align = 'center',
}: {
  children: React.ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems'];
}) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]}>{children}</View>;
}

export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={{ height: 1, backgroundColor: colors.line, marginLeft: inset }} />;
}

/* ------------------------------------------------------------------ */
/* Botões                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';

const buttonPalette = themed((): Record<ButtonVariant, { bg: string; fg: string }> => ({
  primary: { bg: colors.brand, fg: colors.white },
  secondary: { bg: colors.brandSoft, fg: colors.brandDark },
  ghost: { bg: 'transparent', fg: colors.brand },
  danger: { bg: colors.badSoft, fg: colors.bad },
  light: { bg: colors.white, fg: colors.brandDark },
}));

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const p = buttonPalette[variant];
  const isDisabled = disabled || loading;
  const small = size === 'sm';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSm,
        { backgroundColor: p.bg },
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: p.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'brand',
  size = 44,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  tone?: Tone;
  size?: number;
}) {
  const c = toneColors(tone);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons name={icon} size={size * 0.45} color={c.fg} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Formulário                                                          */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  error,
  icon,
  hint,
  ...props
}: TextInputProps & { label?: string; error?: string; icon?: IconName; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <T variant="label">{label}</T> : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          error ? { borderColor: colors.bad } : null,
          props.multiline && { alignItems: 'flex-start' },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.inkFaint}
          accessibilityLabel={label ?? props.placeholder}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            props.multiline && { minHeight: 104, textAlignVertical: 'top', paddingTop: 13 },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as object),
            props.style,
          ]}
        />
      </View>
      {error ? (
        <Row gap={4}>
          <Ionicons name="alert-circle" size={14} color={colors.bad} />
          <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
            {error}
          </T>
        </Row>
      ) : hint ? (
        <T variant="caption" color={colors.inkFaint}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && { color: colors.ink }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Superfícies                                                         */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  onPress,
  style,
  flat,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
}) {
  const base = [styles.card, !flat && elev.shadow, flat && styles.cardFlat];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [...base, pressed && { opacity: 0.93, transform: [{ scale: 0.995 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[...base, style]}>{children}</View>;
}

export function IconBubble({
  icon,
  tone = 'brand',
  size = 40,
  solid,
}: {
  icon: IconName;
  tone?: Tone;
  size?: number;
  solid?: boolean;
}) {
  const c = toneColors(tone);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.36,
        backgroundColor: solid ? c.fg : c.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={solid ? colors.white : c.fg} />
    </View>
  );
}

export function Pill({
  text,
  tone = 'neutral',
  icon,
  style,
}: {
  text: string;
  tone?: Tone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const c = toneColors(tone);
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.pillText, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

/** Mantido por compatibilidade. */
export function Tag({
  text,
  tone = 'neutral',
  icon,
}: {
  text: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  icon?: IconName;
}) {
  const map = { neutral: 'brand', success: 'good', warning: 'warn', danger: 'bad' } as const;
  return <Pill text={text} tone={map[tone]} icon={icon} />;
}

export function Banner({
  tone = 'brand',
  icon,
  title,
  text,
  actionLabel,
  onPress,
}: {
  tone?: Tone;
  icon: IconName;
  title: string;
  text?: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const c = toneColors(tone);
  const content = (
    <Row align="flex-start" gap={spacing.md}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="title" style={{ fontSize: 15 }}>
          {title}
        </T>
        {text ? <T variant="caption">{text}</T> : null}
        {actionLabel ? (
          <Row gap={4} style={{ marginTop: 6 }}>
            <Text style={[styles.bannerAction, { color: c.fg }]}>{actionLabel}</Text>
          </Row>
        ) : null}
      </View>
    </Row>
  );
  const style = [styles.banner, { backgroundColor: c.bg, borderLeftColor: c.fg }];
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [style, pressed && { opacity: 0.9 }]}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: spacing.sm }}>
      <T variant="title">{title}</T>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

/** Mantido por compatibilidade. */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <SectionHeader title={String(children)} />;
}

export function ListRow({
  icon,
  tone = 'brand',
  title,
  subtitle,
  onPress,
  right,
  danger,
}: {
  icon: IconName;
  tone?: Tone;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: colors.bg }]}
    >
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" color={danger ? colors.bad : colors.ink}>
          {title}
        </T>
        {subtitle ? <T variant="caption">{subtitle}</T> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} /> : null)}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Nota de acessibilidade                                              */
/* ------------------------------------------------------------------ */

export function ScoreRing({
  score,
  blocked,
  size = 58,
  stroke,
}: {
  score: number;
  blocked?: boolean;
  size?: number;
  stroke?: number;
}) {
  const c = toneColors(scoreTone(score, blocked));
  const sw = stroke ?? Math.max(5, size * 0.1);
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0.02, score / 100);
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={`Nota de acessibilidade ${score} de 100`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.bg} strokeWidth={sw} fill={colors.surface} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.fg}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ * progress} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontFamily: fonts.extrabold, fontSize: size * 0.32, color: c.fg, letterSpacing: -0.5 }}>
        {score}
      </Text>
    </View>
  );
}

/** Mantido por compatibilidade. */
export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'md' | 'lg' }) {
  return <ScoreRing score={score} size={size === 'lg' ? 88 : 58} />;
}

/* ------------------------------------------------------------------ */
/* Estados                                                             */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <T variant="h2" center>
        {title}
      </T>
      <T variant="body" center style={{ maxWidth: 300 }}>
        {message}
      </T>
      {action ? <View style={{ marginTop: spacing.md, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  container: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: spacing.xl },
  footerInner: { width: '100%', maxWidth: CONTENT_MAX_WIDTH - spacing.xl * 2, alignSelf: 'center', gap: spacing.sm },
  footer: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonSm: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  buttonText: { fontFamily: fonts.bold, fontSize: 15 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputFocused: { borderColor: colors.brand },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.ink,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: { flex: 1, paddingVertical: 9, borderRadius: radius.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface, ...(elev.shadow as object) },
  segmentText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.inkSoft },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardFlat: { borderWidth: 1, borderColor: colors.line },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: { fontFamily: fonts.semibold, fontSize: 12 },
  banner: { borderRadius: radius.md, padding: spacing.lg, borderLeftWidth: 3 },
  bannerAction: { fontFamily: fonts.bold, fontSize: 13 },
  sectionAction: { fontFamily: fonts.bold, fontSize: 13, color: colors.brand },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  emptyHalo: { marginBottom: spacing.sm },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
}));

/** Alterna entre tema claro (vermelho + branco) e escuro (vermelho + preto). */
export function ThemeToggle({ size = 40 }: { size?: number }) {
  const { mode, toggle } = useTheme();
  const dark = mode === 'dark';
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={dark ? 'Usar tema claro' : 'Usar tema escuro'}
      hitSlop={6}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={size * 0.45} color={colors.ink} />
    </Pressable>
  );
}
