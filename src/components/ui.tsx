import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, scoreColor, spacing } from '../theme';

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.screenContent, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenContent, { flex: 1 }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.maxWidth}>{content}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    danger: { bg: colors.surface, fg: colors.danger, border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  }[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && { opacity: 0.85 },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={palette.fg} />}
          <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 96, textAlignVertical: 'top' },
          error ? { borderColor: colors.danger } : null,
          props.style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'md' | 'lg' }) {
  const c = scoreColor(score);
  const big = size === 'lg';
  return (
    <View
      accessibilityLabel={`Nota de acessibilidade ${score} de 100`}
      style={[
        styles.badge,
        { backgroundColor: c.bg, borderColor: c.fg },
        big && { width: 84, height: 84, borderRadius: 42 },
      ]}
    >
      <Text style={[styles.badgeScore, { color: c.fg }, big && { fontSize: 30 }]}>{score}</Text>
      <Text style={[styles.badgeLabel, { color: c.fg }]}>nota</Text>
    </View>
  );
}

export function Tag({
  text,
  tone = 'neutral',
  icon,
}: {
  text: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const t = {
    neutral: { bg: colors.primaryLight, fg: colors.primaryDark },
    success: { bg: colors.successLight, fg: colors.success },
    warning: { bg: colors.warningLight, fg: colors.warning },
    danger: { bg: colors.dangerLight, fg: colors.danger },
  }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }]}>
      {icon && <Ionicons name={icon} size={14} color={t.fg} />}
      <Text style={[styles.tagText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  maxWidth: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  screenContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { gap: spacing.xs },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeScore: { fontSize: 20, fontWeight: '800' },
  badgeLabel: { fontSize: 10, fontWeight: '600', marginTop: -2 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  tagText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyMessage: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
