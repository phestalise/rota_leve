import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, fonts } from '../theme';

/**
 * Marca do Rota Leve: um trajeto suave ligando a origem (anel) ao destino (ponto).
 */
export function LogoMark({ size = 40, inverted = false }: { size?: number; inverted?: boolean }) {
  const bg = inverted ? colors.white : colors.brand;
  const line = inverted ? colors.brand : colors.white;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Rota Leve">
      <Rect width={48} height={48} rx={14} fill={bg} />
      <Path
        d="M15 29 C15 20.5 33 27.5 33 19"
        stroke={line}
        strokeWidth={3.6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={15} cy={33} r={4.2} stroke={line} strokeWidth={3.2} fill={bg} />
      <Circle cx={33} cy={14.5} r={5} fill={line} />
    </Svg>
  );
}

export default function Logo({
  size = 36,
  inverted = false,
  wordmark = true,
}: {
  size?: number;
  inverted?: boolean;
  wordmark?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.3 }}>
      <LogoMark size={size} inverted={inverted} />
      {wordmark && (
        <Text
          style={{
            fontFamily: fonts.extrabold,
            fontSize: size * 0.55,
            letterSpacing: -0.4,
            color: inverted ? colors.white : colors.ink,
          }}
        >
          Rota <Text style={{ color: inverted ? colors.white : colors.brand }}>Leve</Text>
        </Text>
      )}
    </View>
  );
}
