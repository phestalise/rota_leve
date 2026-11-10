import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';
import { Row, T } from './ui';

/** Indicador de etapas do cadastro (1 de 2, 2 de 2). */
export default function Steps({ current, total }: { current: number; total: number }) {
  return (
    <Row gap={10}>
      <Row gap={6}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i + 1 === current ? 28 : 10,
              height: 6,
              borderRadius: 3,
              backgroundColor: i + 1 <= current ? colors.brand : colors.line,
            }}
          />
        ))}
      </Row>
      <T variant="overline">
        Passo {current} de {total}
      </T>
    </Row>
  );
}
