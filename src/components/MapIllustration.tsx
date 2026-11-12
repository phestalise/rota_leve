import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts, getThemeMode } from '../theme';

/**
 * Mapa real (OpenStreetMap) da região da Av. Paulista, em São Paulo.
 * Por cima, em vetor: a rota acessível pela Paulista (vermelha), do MASP até a Consolação, e a rota evitada pela Alameda Santos (cinza), que tem calçada esburacada.
 *
 * As coordenadas do SVG são as mesmas pixels da imagem original (1490 x 1850). Imagem e SVG
 * usam o mesmo recorte central ("cover" / "slice"), então ficam alinhados em qualquer tamanho.
 */
const MAP_LIGHT = require('../../assets/map-light.jpg');
const MAP_DARK = require('../../assets/map-dark.jpg');

const W = 1490;
const H = 1850;

const ORIGIN = { x: 1170, y: 1254 }; // Av. Paulista, perto do MASP
const DEST = { x: 330, y: 441 }; // perto da Estação Consolação
const ROUTE = `M${ORIGIN.x} ${ORIGIN.y} L${DEST.x} ${DEST.y}`; // Av. Paulista
const AVOIDED = `M${ORIGIN.x} ${ORIGIN.y} L1071 1356 L580 883 L679 781`; // Alameda Santos
const PROBLEM = { x: 850, y: 1143 };

export default function MapIllustration({
  style,
  attributionOffset = 4,
}: {
  style?: StyleProp<ViewStyle>;
  /** Distância do crédito do mapa até a borda de baixo (para não ficar sob outro elemento). */
  attributionOffset?: number;
}) {
  const dark = getThemeMode() === 'dark';
  const halo = dark ? '#000000' : '#FFFFFF';

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: dark ? '#111' : '#EEE' }, style]}>
      <Image
        source={dark ? MAP_DARK : MAP_LIGHT}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* rota evitada */}
        <Path
          d={AVOIDED}
          stroke={dark ? '#A0A0A0' : '#3A3A3A'}
          strokeWidth={16}
          strokeDasharray="4 32"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* rota acessível */}
        <Path d={ROUTE} stroke={halo} strokeWidth={46} strokeLinecap="round" fill="none" opacity={0.9} />
        <Path d={ROUTE} stroke={colors.brand} strokeWidth={28} strokeLinecap="round" fill="none" />
        {[
          [508, 613],
          [795, 891],
          [1000, 1089],
        ].map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={15} fill={halo} stroke={colors.brand} strokeWidth={9} />
        ))}

        {/* problema na rota evitada */}
        <Circle cx={PROBLEM.x} cy={PROBLEM.y} r={40} fill={colors.bad} stroke={halo} strokeWidth={10} />
        <Path
          d={`M${PROBLEM.x - 16} ${PROBLEM.y - 16} L${PROBLEM.x + 16} ${PROBLEM.y + 16} M${PROBLEM.x + 16} ${PROBLEM.y - 16} L${PROBLEM.x - 16} ${PROBLEM.y + 16}`}
          stroke="#FFFFFF"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <G>
          <Rect x={500} y={1200} width={400} height={76} rx={38} fill={colors.surface} />
          <SvgText x={700} y={1251} fontSize={36} fontFamily={fonts.semibold} fill={colors.bad} textAnchor="middle">
            Calçada esburacada
          </SvgText>
        </G>

        {/* nota da rota acessível */}
        <G>
          <Rect x={900} y={760} width={330} height={100} rx={50} fill={colors.surface} />
          <Circle cx={952} cy={810} r={34} fill={colors.good} />
          <SvgText x={952} y={822} fontSize={32} fontFamily={fonts.extrabold} fill="#FFFFFF" textAnchor="middle">
            92
          </SvgText>
          <SvgText x={1000} y={824} fontSize={38} fontFamily={fonts.bold} fill={colors.ink}>
            Acessível
          </SvgText>
        </G>

        {/* origem */}
        <Circle cx={ORIGIN.x} cy={ORIGIN.y} r={34} fill={halo} stroke={colors.ink} strokeWidth={16} />

        {/* destino */}
        <G transform={`translate(${DEST.x - 66} ${DEST.y - 196}) scale(3)`}>
          <Path
            d="M22 64 C22 64 0 40 0 22 C0 9.8 9.8 0 22 0 C34.2 0 44 9.8 44 22 C44 40 22 64 22 64 Z"
            fill={colors.brand}
            stroke={halo}
            strokeWidth={3}
          />
          <Circle cx={22} cy={22} r={8} fill="#FFFFFF" />
        </G>
      </Svg>
      <Text style={[styles.attribution, { bottom: attributionOffset, color: dark ? '#888' : '#666' }]}>© OpenStreetMap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    position: 'absolute',
    right: 8,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
});
