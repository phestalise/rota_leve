import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts, getThemeMode } from '../theme';

/**
 * Mapa ilustrativo da tela de boas-vindas: a rota mais rápida (cinza) passa por um elevador
 * quebrado; a rota acessível (vermelha) desvia e chega ao destino.
 * O desenho preenche o contêiner (slice), com o conteúdo importante no centro.
 */
export default function MapIllustration({ style }: { style?: StyleProp<ViewStyle> }) {
  const dark = getThemeMode() === 'dark';
  const ground = dark ? '#141414' : '#ECECE8';
  const block = dark ? '#1B1B1B' : '#E3E3DE';
  const street = dark ? '#2B2B2B' : '#FFFFFF';
  const park = dark ? '#132219' : '#DCEEDC';
  const water = dark ? '#111D27' : '#D8E6F2';

  const H = [90, 210, 330, 440];
  const V = [80, 190, 300];

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: ground }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 380 520" preserveAspectRatio="xMidYMid slice">
        <Rect x={-200} y={-200} width={780} height={920} fill={ground} />

        {/* rio */}
        <Path d="M-200 520 C-40 470 60 540 180 505 C260 482 330 520 580 470 L580 720 L-200 720 Z" fill={water} />

        {/* quarteirões */}
        <G>
          {[
            [92, 102, 86, 96],
            [92, 222, 86, 96],
            [202, 102, 86, 96],
            [-40, 102, 108, 96],
            [-40, 222, 108, 96],
            [312, 222, 120, 96],
            [312, 342, 120, 86],
            [92, 342, 86, 86],
            [-40, -40, 108, 118],
            [92, -40, 86, 118],
            [202, -40, 86, 118],
            [312, -40, 120, 118],
            [312, 102, 120, 96],
          ].map(([x, y, w, h], i) => (
            <Rect key={i} x={x} y={y} width={w} height={h} rx={8} fill={block} />
          ))}
          {/* parque */}
          <Rect x={202} y={222} width={86} height={96} rx={10} fill={park} />
          <Rect x={202} y={342} width={86} height={86} rx={8} fill={block} />
        </G>

        {/* ruas */}
        <G>
          {H.map((y) => (
            <Line key={`h${y}`} x1={-200} y1={y} x2={580} y2={y} stroke={street} strokeWidth={14} />
          ))}
          {V.map((x) => (
            <Line key={`v${x}`} x1={x} y1={-200} x2={x} y2={720} stroke={street} strokeWidth={14} />
          ))}
        </G>

        {/* rota mais rápida (evitada) */}
        <Path
          d="M80 440 L80 330 L190 330 L190 90 L300 90"
          stroke={colors.inkFaint}
          strokeWidth={5}
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* rota acessível */}
        <Path
          d="M80 440 L300 440 L300 90"
          stroke={street}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M80 440 L300 440 L300 90"
          stroke={colors.brand}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {[
          [190, 440],
          [300, 330],
          [300, 210],
        ].map(([x, y]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={street} stroke={colors.brand} strokeWidth={3} />
        ))}

        {/* elevador quebrado */}
        <Circle cx={190} cy={330} r={13} fill={colors.bad} stroke={street} strokeWidth={3} />
        <Path d="M184.5 324.5 L195.5 335.5 M195.5 324.5 L184.5 335.5" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        <G>
          <Rect x={58} y={276} width={126} height={28} rx={14} fill={colors.surface} />
          <SvgText x={121} y={294.5} fontSize={11.5} fontFamily={fonts.semibold} fill={colors.bad} textAnchor="middle">
            Elevador quebrado
          </SvgText>
        </G>

        {/* nota da rota acessível */}
        <G>
          <Rect x={184} y={362} width={110} height={34} rx={17} fill={colors.surface} />
          <Circle cx={202} cy={379} r={11} fill={colors.good} />
          <SvgText x={202} y={383} fontSize={10.5} fontFamily={fonts.extrabold} fill="#FFFFFF" textAnchor="middle">
            92
          </SvgText>
          <SvgText x={219} y={383.5} fontSize={12} fontFamily={fonts.bold} fill={colors.ink}>
            Acessível
          </SvgText>
        </G>

        {/* origem */}
        <Circle cx={80} cy={440} r={11} fill={colors.surface} stroke={colors.ink} strokeWidth={5} />

        {/* destino */}
        <G>
          <Path
            d="M300 96 C300 96 278 72 278 56 C278 43.8 287.8 34 300 34 C312.2 34 322 43.8 322 56 C322 72 300 96 300 96 Z"
            fill={colors.brand}
            stroke={street}
            strokeWidth={3}
          />
          <Circle cx={300} cy={56} r={7.5} fill="#FFFFFF" />
        </G>
      </Svg>
    </View>
  );
}
