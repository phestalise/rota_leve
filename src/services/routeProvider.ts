import { RouteOption, RouteStep } from '../types';
import { normalize } from '../utils/id';
import { STATIONS } from './stations';

/**
 * Provedor de rotas candidatas.
 *
 * O Rota Leve NÃO faz roteamento do zero: em produção as rotas candidatas vêm da
 * Google Directions API (mode=transit, alternatives=true) ou da API Olho Vivo da SPTrans,
 * consumidas pelo backend Java. Aqui simulamos essa resposta de forma determinística
 * (mesma busca = mesmas opções) para o app funcionar offline, no navegador, sem chave de API.
 *
 * O produto é a camada de acessibilidade (accessibility.ts) que avalia e reordena essas opções.
 */

/** Estações que podem servir de origem (as demais são usadas como baldeação/destino). */
const ORIGIN_POOL = ['Tatuapé', 'Pinheiros', 'Luz', 'Santa Cecília', 'Consolação', 'Paulista'];

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function resolveOriginStation(origin: string) {
  const n = normalize(origin);
  const match = ORIGIN_POOL.find((s) => n.includes(normalize(s)));
  return match ?? ORIGIN_POOL[hash(n) % ORIGIN_POOL.length];
}

let stepCounter = 0;
function step(data: Omit<RouteStep, 'id'>): RouteStep {
  stepCounter += 1;
  return { id: `stp_${stepCounter}`, ...data };
}

function finalize(
  id: string,
  origin: string,
  destination: string,
  summary: string,
  steps: RouteStep[],
): RouteOption {
  const walkMeters = steps.filter((s) => s.mode === 'walk').reduce((a, s) => a + s.distanceMeters, 0);
  const rides = steps.filter((s) => s.mode !== 'walk').length;
  return {
    id,
    origin,
    destination,
    summary,
    steps,
    walkMeters,
    transfers: Math.max(0, rides - 1),
    durationMin: steps.reduce((a, s) => a + s.durationMin, 0),
  };
}

export async function fetchCandidateRoutes(origin: string, destination: string): Promise<RouteOption[]> {
  // Simula a latência da chamada à API externa.
  await new Promise((r) => setTimeout(r, 700));

  const o = resolveOriginStation(origin);
  const seed = hash(normalize(origin) + '|' + normalize(destination));
  const jitter = (n: number) => n + (seed % 5);
  const key = seed.toString(36);
  const oLine = STATIONS[o]?.line ?? 'Metrô';

  const viaSe = finalize(`r_${key}_se`, origin, destination, `Metrô via Sé até Paraíso`, [
    step({ mode: 'walk', from: origin, to: `Estação ${o}`, street: 'Calçada de acesso à estação', distanceMeters: 250, durationMin: 4, slope: 'plana' }),
    step({ mode: 'metro', from: o, to: 'Sé', line: oLine, stations: [o, 'Sé'], distanceMeters: 6000, durationMin: jitter(12) }),
    step({ mode: 'metro', from: 'Sé', to: 'Paraíso', line: 'Linha 1-Azul', stations: ['Sé', 'Paraíso'], distanceMeters: 3500, durationMin: 7 }),
    step({ mode: 'walk', from: 'Estação Paraíso', to: destination, street: 'Rua Vergueiro', distanceMeters: 350, durationMin: 6, slope: 'plana' }),
  ]);

  const viaAnaRosa = finalize(`r_${key}_ar`, origin, destination, `Metrô até Ana Rosa (mais rápida)`, [
    step({ mode: 'walk', from: origin, to: `Estação ${o}`, street: 'Calçada de acesso à estação', distanceMeters: 150, durationMin: 2, slope: 'plana' }),
    step({ mode: 'metro', from: o, to: 'Ana Rosa', line: oLine, stations: [o, 'Ana Rosa'], distanceMeters: 8000, durationMin: jitter(14) }),
    step({ mode: 'walk', from: 'Estação Ana Rosa', to: destination, street: 'Rua Domingos de Morais', distanceMeters: 750, durationMin: 11, slope: 'ingreme' }),
  ]);

  const bus = finalize(`r_${key}_bus`, origin, destination, `Ônibus direto 875A`, [
    step({ mode: 'walk', from: origin, to: 'Ponto Av. Paulista, 1000', street: 'Av. Paulista', distanceMeters: 200, durationMin: 3, slope: 'plana' }),
    step({ mode: 'bus', from: 'Ponto Av. Paulista, 1000', to: 'Ponto Rua Vergueiro, 1200', line: '875A-10', stop: 'Ponto Av. Paulista, 1000', distanceMeters: 9000, durationMin: jitter(32) }),
    step({ mode: 'walk', from: 'Ponto Rua Vergueiro, 1200', to: destination, street: 'Rua Vergueiro', distanceMeters: 150, durationMin: 2, slope: 'plana' }),
  ]);

  const viaRepublica = finalize(`r_${key}_rep`, origin, destination, `Metrô até República + ônibus`, [
    step({ mode: 'walk', from: origin, to: `Estação ${o}`, street: 'Calçada de acesso à estação', distanceMeters: 300, durationMin: 5, slope: 'moderada' }),
    step({ mode: 'metro', from: o, to: 'República', line: oLine, stations: [o, 'República'], distanceMeters: 5000, durationMin: jitter(10) }),
    step({ mode: 'bus', from: 'Ponto Av. Liberdade, 300', to: 'Ponto Av. Brigadeiro Luís Antônio, 800', line: '5106-10', stop: 'Ponto Av. Liberdade, 300', distanceMeters: 4000, durationMin: 15 }),
    step({ mode: 'walk', from: 'Ponto Av. Brigadeiro Luís Antônio, 800', to: destination, street: 'Av. Brigadeiro Luís Antônio', distanceMeters: 100, durationMin: 2, slope: 'plana' }),
  ]);

  const viaBras = finalize(`r_${key}_bras`, origin, destination, `Trem até Brás + ônibus`, [
    step({ mode: 'walk', from: origin, to: `Estação ${o}`, street: 'Calçada de acesso à estação', distanceMeters: 200, durationMin: 3, slope: 'plana' }),
    step({ mode: 'train', from: o, to: 'Brás', line: 'CPTM Linha 11-Coral', stations: [o, 'Brás'], distanceMeters: 7000, durationMin: jitter(9) }),
    step({ mode: 'bus', from: 'Terminal Parque Dom Pedro II', to: 'Ponto Rua da Consolação, 500', line: '6450-10', stop: 'Terminal Parque Dom Pedro II', distanceMeters: 5000, durationMin: 18 }),
    step({ mode: 'walk', from: 'Ponto Rua da Consolação, 500', to: destination, street: 'Rua da Consolação', distanceMeters: 250, durationMin: 4, slope: 'moderada' }),
  ]);

  // Ordem "padrão" de um app comum: mais rápida primeiro.
  return [viaAnaRosa, viaBras, viaSe, viaRepublica, bus].sort((a, b) => a.durationMin - b.durationMin);
}
