import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, IconBubble, IconName, Row, Screen, SectionHeader, T } from '../components/ui';
import { colors, fonts, radius, spacing } from '../theme';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'person-circle-outline',
    title: 'Você conta como se desloca',
    text: 'Gestante, cadeira de rodas, carrinho, idoso(a) ou mobilidade reduzida. Isso define o que pesa na rota.',
  },
  {
    icon: 'podium-outline',
    title: 'A gente dá nota para cada rota',
    text: 'Buscamos as opções de transporte e avaliamos escadas, elevadores, caminhada, ladeiras e bancos.',
  },
  {
    icon: 'megaphone-outline',
    title: 'A comunidade mantém tudo atualizado',
    text: 'Relatos com foto, confirmados por outras pessoas. Se ninguém confirmar, o relato expira.',
  },
  {
    icon: 'notifications-outline',
    title: 'Você é avisado(a) a tempo',
    text: 'Se algo quebrar numa rota salva, o app avisa e mostra alternativas.',
  },
];

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.circle, { width: 180, height: 180, top: -60, right: -50 }]} />
        <View style={styles.logo}>
          <Ionicons name="walk" size={28} color={colors.brand} />
        </View>
        <T variant="h1" color={colors.white}>
          Rota Leve
        </T>
        <T variant="body" color="rgba(255,255,255,0.85)">
          O caminho mais fácil, não só o mais rápido.
        </T>
      </View>

      <Card style={styles.quote}>
        <Ionicons name="chatbox-ellipses" size={22} color={colors.accent} />
        <T variant="body" color={colors.ink} style={{ fontSize: 15.5, lineHeight: 24 }}>
          A Júlia está grávida de 8 meses e precisa ir ao pré-natal. O app comum manda ela pela estação com o
          elevador quebrado. No Rota Leve, essa rota cai para o fim da lista e ela recebe uma alternativa com
          elevador funcionando e pouca caminhada.
        </T>
      </Card>

      <SectionHeader title="Como funciona" />
      <Card style={{ gap: spacing.lg }}>
        {STEPS.map((s, i) => (
          <Row key={s.title} gap={spacing.md} align="flex-start">
            <View>
              <IconBubble icon={s.icon} size={42} />
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="title" style={{ fontSize: 15 }}>
                {s.title}
              </T>
              <T variant="caption">{s.text}</T>
            </View>
          </Row>
        ))}
      </Card>

      <SectionHeader title="Objetivos de Desenvolvimento Sustentável" />
      <Row gap={spacing.md} align="stretch">
        <View style={[styles.ods, { backgroundColor: '#DD1367' }]}>
          <Text style={styles.odsNum}>10</Text>
          <Text style={styles.odsText}>Redução das desigualdades</Text>
        </View>
        <View style={[styles.ods, { backgroundColor: '#FD9D24' }]}>
          <Text style={styles.odsNum}>11</Text>
          <Text style={styles.odsText}>Cidades e comunidades sustentáveis</Text>
        </View>
      </Row>

      <SectionHeader title="Tecnologia" />
      <Card>
        <T variant="caption">
          React Native (Expo) com dados salvos no aparelho via AsyncStorage. As rotas candidatas simulam a Google
          Directions API (modo transit) e a nota de acessibilidade é calculada pela camada do Rota Leve.
        </T>
        <T variant="overline">Versão {version} · Global Solution 2026 · FIAP</T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brand, borderRadius: radius.xl, padding: spacing.xl, gap: 4, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: colors.white, opacity: 0.09 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quote: { gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.accent },
  stepNum: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  stepNumText: { fontFamily: fonts.extrabold, fontSize: 9.5, color: colors.white },
  ods: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  odsNum: { fontFamily: fonts.extrabold, fontSize: 30, color: colors.white },
  odsText: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, color: colors.white },
});
