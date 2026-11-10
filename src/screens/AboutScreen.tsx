import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Screen, SectionTitle } from '../components/ui';
import { colors, spacing } from '../theme';

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  {
    icon: 'person-circle-outline',
    title: 'Perfil de mobilidade',
    text: 'Você conta se está grávida, usa cadeira de rodas, anda com carrinho, é idoso(a) ou está com mobilidade reduzida. Isso define o que pesa na rota.',
  },
  {
    icon: 'navigate-circle-outline',
    title: 'Rotas reordenadas',
    text: 'Buscamos as opções de transporte público e damos uma nota de acessibilidade para cada uma, considerando escadas, elevadores, caminhada, ladeiras e bancos.',
  },
  {
    icon: 'megaphone-outline',
    title: 'Comunidade',
    text: 'Usuários relatam elevador quebrado, calçada esburacada ou ponto sem cobertura. Outros confirmam, e o relato expira se ninguém confirmar.',
  },
  {
    icon: 'notifications-outline',
    title: 'Avisos',
    text: 'Se algo quebrar numa rota que você salvou, o app avisa e sugere alternativas.',
  },
];

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="walk" size={36} color="#fff" />
        </View>
        <Text style={styles.title}>Rota Leve</Text>
        <Text style={styles.subtitle}>
          Rotas de transporte público avaliadas para gestantes, pessoas com carrinho de bebê, idosos,
          cadeirantes e pessoas com mobilidade reduzida.
        </Text>
      </View>

      <Card style={styles.story}>
        <Text style={styles.storyText}>
          “A Júlia está grávida de 8 meses e precisa ir ao pré-natal. O app comum manda ela pela
          estação que está com o elevador quebrado há dias. No Rota Leve, essa rota cai para o fim da
          lista e ela recebe uma alternativa com elevador funcionando e pouca caminhada.”
        </Text>
      </Card>

      <SectionTitle>Como funciona</SectionTitle>
      {STEPS.map((s) => (
        <Card key={s.title} style={styles.step}>
          <Ionicons name={s.icon} size={30} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.stepTitle}>{s.title}</Text>
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        </Card>
      ))}

      <SectionTitle>Objetivos de Desenvolvimento Sustentável</SectionTitle>
      <Card>
        <Text style={styles.stepText}>
          <Text style={styles.bold}>ODS 10</Text> – Redução das desigualdades: mobilidade urbana para
          quem mais tem dificuldade de se deslocar.
        </Text>
        <Text style={styles.stepText}>
          <Text style={styles.bold}>ODS 11</Text> – Cidades e comunidades sustentáveis: transporte
          público acessível e dados colaborativos sobre a infraestrutura.
        </Text>
      </Card>

      <SectionTitle>Tecnologia</SectionTitle>
      <Card>
        <Text style={styles.stepText}>
          App em React Native (Expo) com dados salvos no aparelho via AsyncStorage. As rotas
          candidatas simulam a Google Directions API (modo transit) e a nota de acessibilidade é
          calculada pela camada do Rota Leve.
        </Text>
        <Text style={styles.version}>Versão {version} · Global Solution 2026 · FIAP</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.primaryDark },
  subtitle: { textAlign: 'center', color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  story: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  storyText: { fontStyle: 'italic', color: colors.primaryDark, fontSize: 15, lineHeight: 22 },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepTitle: { fontWeight: '800', color: colors.text, fontSize: 15 },
  stepText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: '800' },
  version: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});
