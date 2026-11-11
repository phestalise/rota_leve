import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Button, Pill, Row, ScoreRing, T, ThemeToggle } from '../components/ui';
import { AuthStackParamList } from '../navigation/types';
import { colors, radius, spacing, themed, useIsWide } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const FEATURES: { title: string; text: string }[] = [
  {
    title: 'Você diz como se desloca',
    text: 'Gestante, cadeira de rodas, carrinho de bebê, pessoa idosa ou com mobilidade reduzida.',
  },
  {
    title: 'O app dá uma nota para cada rota',
    text: 'Conta escadas, elevadores, distância a pé, ladeiras e se tem onde sentar.',
  },
  {
    title: 'Outros usuários avisam dos problemas',
    text: 'Se o elevador de uma estação da sua rota quebrar, você recebe um aviso.',
  },
];

/** Prévia ilustrativa de como uma rota aparece no app. */
function RoutePreview() {
  return (
    <View style={styles.preview}>
      <Row gap={spacing.md}>
        <ScoreRing score={92} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="overline">Exemplo para gestante</T>
          <T variant="title">Tatuapé até Hospital São Paulo</T>
          <T variant="caption">42 min · 1 baldeação · 380 m a pé</T>
        </View>
      </Row>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <Pill text="Elevador funcionando" tone="good" />
        <Pill text="Sem escadas" tone="good" />
        <Pill text="Tem onde sentar" tone="neutral" />
      </Row>
      <View style={styles.previewAlert}>
        <T variant="caption" color={colors.ink} style={{ flex: 1 }}>
          A rota mais rápida passa pela Sé, onde o elevador está quebrado. Por isso ela aparece por último.
        </T>
      </View>
    </View>
  );
}

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();

  const actions = (
    <View style={{ gap: spacing.sm }}>
      <Button title="Criar conta" onPress={() => navigation.navigate('Register')} />
      <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.navigate('Login')} />
    </View>
  );

  const intro = (
    <View style={{ gap: spacing.md }}>
      <T variant="display" style={wide ? { fontSize: 44, lineHeight: 52, letterSpacing: -1 } : { fontSize: 32, lineHeight: 38 }}>
        Transporte público com menos escada e menos caminhada.
      </T>
      <T variant="body" style={{ fontSize: 16, lineHeight: 24 }}>
        O Rota Leve compara as opções de ônibus, metrô e trem em São Paulo e mostra primeiro as que
        são mais fáceis para você.
      </T>
    </View>
  );

  const features = (
    <View style={{ gap: spacing.lg }}>
      {FEATURES.map((f, i) => (
        <Row key={f.title} gap={spacing.md} align="flex-start">
          <T variant="title" color={colors.brand} style={{ width: 18 }}>
            {i + 1}
          </T>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="title" style={{ fontSize: 15 }}>
              {f.title}
            </T>
            <T variant="caption">{f.text}</T>
          </View>
        </Row>
      ))}
    </View>
  );

  const header = (
    <Row style={{ justifyContent: 'space-between' }}>
      <Logo size={36} />
      <ThemeToggle />
    </Row>
  );

  if (wide) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.widePage, { paddingTop: insets.top + spacing.xl }]}
      >
        {header}
        <Row align="center" gap={64} style={{ flex: 1, paddingVertical: spacing.xxxl }}>
          <View style={{ flex: 1, gap: spacing.xxl, maxWidth: 520 }}>
            {intro}
            {features}
            <Row gap={spacing.sm}>
              <Button title="Criar conta" onPress={() => navigation.navigate('Register')} style={{ paddingHorizontal: 28 }} />
              <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.navigate('Login')} style={{ paddingHorizontal: 28 }} />
            </Row>
          </View>
          <View style={{ flex: 1, maxWidth: 440 }}>
            <RoutePreview />
          </View>
        </Row>
        <T variant="caption" color={colors.inkFaint}>
          Global Solution 2026, FIAP
        </T>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={[styles.mobilePage, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {header}
        {intro}
        <RoutePreview />
        {features}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {actions}
      </SafeAreaView>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    widePage: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 1080,
      alignSelf: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
    },
    mobilePage: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xxl },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      backgroundColor: colors.surface,
    },
    preview: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.xl,
      gap: spacing.lg,
    },
    previewAlert: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
      backgroundColor: colors.badSoft,
      borderRadius: radius.md,
      padding: spacing.md,
    },
  }),
);
