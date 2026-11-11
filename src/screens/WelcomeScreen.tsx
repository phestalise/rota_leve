import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import MapIllustration from '../components/MapIllustration';
import { Button, Row, T, ThemeToggle } from '../components/ui';
import { AuthStackParamList } from '../navigation/types';
import { colors, radius, spacing, themed, useIsWide } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();

  const slogan = (size: number) => {
    const style = { fontSize: size, lineHeight: size * 1.12, letterSpacing: -1 };
    return (
      <T variant="display" style={style}>
        Sua rota{'\n'}
        <T variant="display" color={colors.brand} style={style}>
          acessível.
        </T>
      </T>
    );
  };

  const subtitle = (
    <T variant="body" style={{ fontSize: 16, lineHeight: 24 }}>
      Ônibus e metrô sem escada no caminho, com elevador funcionando e menos caminhada.
    </T>
  );

  const goRegister = () => navigation.navigate('Register');
  const goLogin = () => navigation.navigate('Login');

  if (wide) {
    return (
      <View style={styles.widePage}>
        <View style={[styles.wideLeft, { paddingTop: insets.top + spacing.xl }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Logo size={36} />
            <ThemeToggle />
          </Row>
          <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg, maxWidth: 440 }}>
            {slogan(64)}
            {subtitle}
            <Row gap={spacing.sm} style={{ marginTop: spacing.md }}>
              <Button title="Criar conta" onPress={goRegister} style={{ paddingHorizontal: 32 }} />
              <Button title="Já tenho conta" variant="secondary" onPress={goLogin} style={{ paddingHorizontal: 32 }} />
            </Row>
          </View>
        </View>
        <MapIllustration style={styles.wideMap} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        <MapIllustration style={StyleSheet.absoluteFill} attributionOffset={34} />
        <Row style={[styles.mobileTop, { top: insets.top + spacing.md }]}>
          <View style={styles.logoChip}>
            <Logo size={30} />
          </View>
          <ThemeToggle />
        </Row>
      </View>
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        {slogan(38)}
        {subtitle}
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Button title="Criar conta" onPress={goRegister} />
          <Button title="Já tenho conta" variant="secondary" onPress={goLogin} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    widePage: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
    wideLeft: { flex: 1, paddingHorizontal: 64, paddingBottom: spacing.xxxl },
    wideMap: { flex: 1.1, margin: spacing.lg, borderRadius: radius.xl },
    mobileTop: {
      position: 'absolute',
      left: spacing.xl,
      right: spacing.xl,
      justifyContent: 'space-between',
    },
    logoChip: {
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      paddingVertical: 6,
      paddingLeft: 6,
      paddingRight: 14,
    },
    sheet: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -28,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
  }),
);
