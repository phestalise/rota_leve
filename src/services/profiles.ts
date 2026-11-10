import { Ionicons } from '@expo/vector-icons';
import { MobilityProfile, MobilityType } from '../types';

export const MOBILITY_OPTIONS: {
  type: MobilityType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaults: Omit<MobilityProfile, 'type'>;
}[] = [
  {
    type: 'gestante',
    label: 'Estou grávida',
    description: 'Menos caminhada, evitar escadas e priorizar assento.',
    icon: 'heart-outline',
    defaults: {
      avoidStairs: true,
      maxWalkMeters: 500,
      preferElevator: true,
      needSeat: true,
      avoidSteepSlopes: true,
    },
  },
  {
    type: 'cadeirante',
    label: 'Uso cadeira de rodas',
    description: 'Escadas sem elevador tornam a rota inviável.',
    icon: 'accessibility-outline',
    defaults: {
      avoidStairs: true,
      maxWalkMeters: 800,
      preferElevator: true,
      needSeat: false,
      avoidSteepSlopes: true,
    },
  },
  {
    type: 'carrinho',
    label: 'Ando com carrinho de bebê',
    description: 'Elevador e calçadas lisas fazem toda a diferença.',
    icon: 'cart-outline',
    defaults: {
      avoidStairs: true,
      maxWalkMeters: 700,
      preferElevator: true,
      needSeat: false,
      avoidSteepSlopes: true,
    },
  },
  {
    type: 'idoso',
    label: 'Sou idoso(a)',
    description: 'Caminhadas curtas, assento e poucas baldeações.',
    icon: 'body-outline',
    defaults: {
      avoidStairs: true,
      maxWalkMeters: 400,
      preferElevator: true,
      needSeat: true,
      avoidSteepSlopes: true,
    },
  },
  {
    type: 'temporaria',
    label: 'Mobilidade reduzida temporária',
    description: 'Perna engessada, pós-cirurgia, muletas.',
    icon: 'bandage-outline',
    defaults: {
      avoidStairs: true,
      maxWalkMeters: 300,
      preferElevator: true,
      needSeat: true,
      avoidSteepSlopes: false,
    },
  },
];

export const WALK_LIMITS = [200, 300, 400, 500, 700, 800, 1000];

export function profileLabel(type?: MobilityType) {
  return MOBILITY_OPTIONS.find((o) => o.type === type)?.label ?? 'Perfil não definido';
}

export function profileIcon(type?: MobilityType): keyof typeof Ionicons.glyphMap {
  return MOBILITY_OPTIONS.find((o) => o.type === type)?.icon ?? 'help-circle-outline';
}
