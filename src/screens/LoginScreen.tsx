import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Button, Field, Row, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { TEST_USER } from '../storage/seed';
import { colors, radius, spacing, themed, useIsWide } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
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
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.page,
        { paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        wide && { justifyContent: 'center' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.column, wide && styles.card]}>
        {wide && <Logo size={36} />}
        <View style={{ gap: 6, marginTop: wide ? spacing.xl : 0 }}>
          <T variant="h1" style={{ fontSize: 26, lineHeight: 32 }}>
            Entrar
          </T>
          <T variant="body">Que bom te ver de novo. Suas rotas estão te esperando.</T>
        </View>

        <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
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
            onSubmitEditing={handleLogin}
          />

          {error ? (
            <Row gap={6} style={styles.error}>
              <Ionicons name="alert-circle" size={16} color={colors.bad} />
              <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
                {error}
              </T>
            </Row>
          ) : null}

          <Button title="Entrar" iconRight="arrow-forward" onPress={handleLogin} loading={loading} />

          <Pressable onPress={useTestAccount} style={styles.testCard} accessibilityRole="button">
            <Ionicons name="flask-outline" size={18} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <T variant="label">Usar conta de teste</T>
              <T variant="caption">
                {TEST_USER.email} · {TEST_USER.password}
              </T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
          </Pressable>

          <Row gap={4} style={{ justifyContent: 'center' }}>
            <T variant="body">Ainda não tem conta?</T>
            <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <T variant="bodyStrong" color={colors.brand}>
                Criar conta
              </T>
            </Pressable>
          </Row>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    page: { flexGrow: 1, paddingHorizontal: spacing.xl, alignItems: 'center' },
    column: { width: '100%', maxWidth: 440 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.xxxl,
    },
    error: { backgroundColor: colors.badSoft, padding: spacing.md, borderRadius: radius.sm },
    testCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.line,
    },
  }),
);
