import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { TEST_USER } from '../storage/seed';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="walk" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Rota Leve</Text>
        <Text style={styles.subtitle}>
          Rotas de transporte público pensadas para quem precisa de mais acessibilidade.
        </Text>
      </View>

      <Card>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
          onSubmitEditing={handleLogin}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Entrar" icon="log-in-outline" onPress={handleLogin} loading={loading} />
        <Button
          title="Criar conta"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
        />
      </Card>

      <Card style={styles.hint}>
        <Text style={styles.hintTitle}>Usuário de teste</Text>
        <Text style={styles.hintText}>E-mail: {TEST_USER.email}</Text>
        <Text style={styles.hintText}>Senha: {TEST_USER.password}</Text>
        <Button
          title="Preencher dados de teste"
          variant="secondary"
          onPress={() => {
            setEmail(TEST_USER.email);
            setPassword(TEST_USER.password);
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.primaryDark },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', maxWidth: 320 },
  error: { color: colors.danger, fontWeight: '600' },
  hint: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  hintTitle: { fontWeight: '700', color: colors.primaryDark },
  hintText: { color: colors.text },
});
