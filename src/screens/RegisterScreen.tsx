import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Card, Field, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'Informe seu nome (mínimo 3 letras).';
    if (!EMAIL_REGEX.test(email.trim())) e.email = 'E-mail inválido.';
    if (password.length < 6) e.password = 'A senha precisa ter pelo menos 6 caracteres.';
    if (confirm !== password) e.confirm = 'As senhas não conferem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.intro}>
        Crie sua conta. Em seguida você vai configurar seu perfil de mobilidade.
      </Text>
      <Card>
        <Field label="Nome completo" value={name} onChangeText={setName} error={errors.name} />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <Field
          label="Confirmar senha"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={errors.confirm}
        />
        {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
        <Button title="Cadastrar" icon="person-add-outline" onPress={handleRegister} loading={loading} />
        <Button title="Já tenho conta" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textMuted, fontSize: 15 },
  error: { color: colors.danger, fontWeight: '600' },
});
