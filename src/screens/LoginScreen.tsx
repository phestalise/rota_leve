import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Row, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { TEST_USER } from '../storage/seed';
import { colors, fonts, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e = email, p = password) {
    setError('');
    if (!e.trim() || !p) {
      setError('Informe e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(e, p);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  function useTestAccount() {
    setEmail(TEST_USER.email);
    setPassword(TEST_USER.password);
    setError('');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.brand }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 48 }]}>
        <View style={[styles.circle, { width: 260, height: 260, top: -90, right: -70, opacity: 0.12 }]} />
        <View style={[styles.circle, { width: 140, height: 140, top: 120, left: -50, opacity: 0.08 }]} />
        <View style={[styles.dot, { top: insets.top + 56, right: 48 }]} />

        <View style={styles.logo}>
          <Ionicons name="walk" size={30} color={colors.brand} />
        </View>
        <T variant="display" color={colors.white} style={{ fontSize: 34, lineHeight: 40 }}>
          Rota Leve
        </T>
        <T variant="body" color="rgba(255,255,255,0.82)" style={{ maxWidth: 290 }}>
          O caminho mais fácil, não só o mais rápido.
        </T>
        <Row gap={6} style={{ marginTop: spacing.md, flexWrap: 'wrap' }}>
          {['Gestantes', 'Cadeirantes', 'Carrinho de bebê', 'Idosos'].map((t) => (
            <View key={t} style={styles.heroChip}>
              <T variant="caption" color={colors.white} style={{ fontFamily: fonts.semibold }}>
                {t}
              </T>
            </View>
          ))}
        </Row>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <View style={{ gap: 4 }}>
          <T variant="h1">Bem-vindo(a) de volta</T>
          <T variant="body">Entre para ver rotas pensadas para você.</T>
        </View>

        <Field
          label="E-mail"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Senha"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Sua senha"
          secureTextEntry
          onSubmitEditing={() => handleLogin()}
        />

        {error ? (
          <Row gap={6} style={styles.error}>
            <Ionicons name="alert-circle" size={16} color={colors.bad} />
            <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
              {error}
            </T>
          </Row>
        ) : null}

        <Button title="Entrar" iconRight="arrow-forward" onPress={() => handleLogin()} loading={loading} />

        <Pressable onPress={useTestAccount} style={styles.testCard} accessibilityRole="button">
          <View style={styles.testIcon}>
            <Ionicons name="flask-outline" size={18} color="#C2502F" />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="label">Usar conta de teste</T>
            <T variant="caption">
              {TEST_USER.email} · {TEST_USER.password}
            </T>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
        </Pressable>

        <Row gap={4} style={{ justifyContent: 'center', marginTop: spacing.sm }}>
          <T variant="body">Ainda não tem conta?</T>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
            <T variant="bodyStrong" color={colors.brand}>
              Criar conta
            </T>
          </Pressable>
        </Row>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 48,
    gap: 6,
    overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.white },
  dot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  error: { backgroundColor: colors.badSoft, padding: spacing.md, borderRadius: radius.sm },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  testIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
