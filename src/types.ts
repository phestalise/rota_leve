export type MobilityType = 'gestante' | 'cadeirante' | 'carrinho' | 'idoso' | 'temporaria';

export interface MobilityProfile {
  type: MobilityType;
  avoidStairs: boolean;
  maxWalkMeters: number;
  preferElevator: boolean;
  needSeat: boolean;
  avoidSteepSlopes: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profile?: MobilityProfile;
  createdAt: string;
}

export type StepMode = 'walk' | 'bus' | 'metro' | 'train';
export type Slope = 'plana' | 'moderada' | 'ingreme';

export interface RouteStep {
  id: string;
  mode: StepMode;
  from: string;
  to: string;
  line?: string;
  street?: string;
  distanceMeters: number;
  durationMin: number;
  slope?: Slope;
  /** Estações por onde o passageiro entra/sai (metrô/trem) */
  stations?: string[];
  /** Ponto de ônibus de embarque */
  stop?: string;
}

export interface RouteOption {
  id: string;
  origin: string;
  destination: string;
  summary: string;
  durationMin: number;
  walkMeters: number;
  transfers: number;
  steps: RouteStep[];
}

export interface ScoredRoute extends RouteOption {
  score: number;
  blocked: boolean;
  issues: string[];
  highlights: string[];
  explanation: string;
}

export interface SavedRoute {
  id: string;
  userId: string;
  name: string;
  route: ScoredRoute;
  savedAt: string;
}

export type ReportCategory =
  | 'elevador'
  | 'escada_rolante'
  | 'calcada'
  | 'rampa'
  | 'cobertura'
  | 'outro';

export type ReportStatus = 'ativo' | 'resolvido' | 'expirado';

export interface Report {
  id: string;
  userId: string;
  userName: string;
  category: ReportCategory;
  location: string;
  description: string;
  photoUri?: string;
  createdAt: string;
  expiresAt: string;
  confirmations: string[];
  status: ReportStatus;
}
