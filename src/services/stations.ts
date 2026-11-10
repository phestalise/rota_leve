/**
 * Dados de infraestrutura das estações/pontos usados na simulação.
 * Em produção esses dados viriam da API Java (Ponto Crítico) e dos relatos da comunidade.
 */
export interface StationInfo {
  name: string;
  line: string;
  hasElevator: boolean;
  hasEscalator: boolean;
  hasSeats: boolean;
  covered: boolean;
}

export const STATIONS: Record<string, StationInfo> = {
  Sé: { name: 'Sé', line: 'Linha 1-Azul / 3-Vermelha', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  Paraíso: { name: 'Paraíso', line: 'Linha 1-Azul / 2-Verde', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  Paulista: { name: 'Paulista', line: 'Linha 4-Amarela', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  Consolação: { name: 'Consolação', line: 'Linha 2-Verde', hasElevator: true, hasEscalator: true, hasSeats: false, covered: true },
  República: { name: 'República', line: 'Linha 3-Vermelha / 4-Amarela', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  Luz: { name: 'Luz', line: 'Linha 1-Azul / 4-Amarela', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  'Ana Rosa': { name: 'Ana Rosa', line: 'Linha 1-Azul / 2-Verde', hasElevator: false, hasEscalator: true, hasSeats: false, covered: true },
  Brás: { name: 'Brás', line: 'Linha 3-Vermelha / CPTM', hasElevator: false, hasEscalator: false, hasSeats: true, covered: true },
  Tatuapé: { name: 'Tatuapé', line: 'Linha 3-Vermelha', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  Pinheiros: { name: 'Pinheiros', line: 'Linha 4-Amarela / 9-Esmeralda', hasElevator: true, hasEscalator: true, hasSeats: true, covered: true },
  'Santa Cecília': { name: 'Santa Cecília', line: 'Linha 3-Vermelha', hasElevator: false, hasEscalator: true, hasSeats: true, covered: true },
  Vergueiro: { name: 'Vergueiro', line: 'Linha 1-Azul', hasElevator: true, hasEscalator: false, hasSeats: false, covered: true },
};

/** Pontos de ônibus (podem não ter cobertura nem banco). */
export const BUS_STOPS: Record<string, { hasSeats: boolean; covered: boolean }> = {
  'Ponto Av. Paulista, 1000': { hasSeats: true, covered: true },
  'Ponto Rua da Consolação, 500': { hasSeats: false, covered: false },
  'Ponto Av. Liberdade, 300': { hasSeats: true, covered: false },
  'Ponto Rua Vergueiro, 1200': { hasSeats: false, covered: true },
  'Terminal Parque Dom Pedro II': { hasSeats: true, covered: true },
  'Ponto Av. Brigadeiro Luís Antônio, 800': { hasSeats: true, covered: true },
};

export const ORIGIN_SUGGESTIONS = [
  'Tatuapé',
  'Pinheiros',
  'Luz',
  'Santa Cecília',
  'Brás',
  'Consolação',
];

export const DESTINATION_SUGGESTIONS = [
  'Hospital São Paulo (Vila Clementino)',
  'UBS Sé',
  'Hospital das Clínicas',
  'Shopping Paulista',
  'Parque Ibirapuera',
];
