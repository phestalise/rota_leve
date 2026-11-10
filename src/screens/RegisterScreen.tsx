import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Steps from '../components/Steps';
import { Button, Field, Row, Screen, T } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

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
      setLoading(false);
    }
  }

  return (
    <Screen
      footer={
        <Button title="Continuar" iconRight="arrow-forward" onPress={handleRegister} loading={loading} />
      }
    >
      <Steps current={1} total={2} />
      <View style={{ gap: 6 }}>
        <T variant="h1">Crie sua conta</T>
        <T variant="body">Leva menos de um minuto. Depois, você conta como se desloca.</T>
      </View>

      <Field label="Nome completo" icon="person-outline" value={name} onChangeText={setName} placeholder="Como podemos te chamar?" error={errors.name} />
      <Field
        label="E-mail"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <Field
        label="Senha"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        error={errors.password}
      />
      <Field
        label="Confirmar senha"
        icon="shield-checkmark-outline"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repita a senha"
        secureTextEntry
        error={errors.confirm}
        onSubmitEditing={handleRegister}
      />

      {errors.form ? (
        <Row gap={6} style={{ backgroundColor: colors.badSoft, padding: spacing.md, borderRadius: radius.sm }}>
          <Ionicons name="alert-circle" size={16} color={colors.bad} />
          <T variant="caption" color={colors.bad} style={{ flex: 1 }}>
            {errors.form}
          </T>
        </Row>
      ) : null}

      <Row gap={4} style={{ justifyContent: 'center' }}>
        <T variant="body">Já tem conta?</T>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <T variant="bodyStrong" color={colors.brand}>
            Entrar
          </T>
        </Pressable>
      </Row>
    </Screen>
  );
}
