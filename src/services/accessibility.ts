import { MobilityProfile, Report, RouteOption, RouteStep, ScoredRoute } from '../types';
import { normalize, transfersLabel } from '../utils/id';
import { BUS_STOPS, STATIONS } from './stations';

/**
 * Camada de acessibilidade do Rota Leve.
 * Recebe as rotas candidatas (Google Directions / SPTrans), cruza com a infraestrutura
 * conhecida + relatos ativos da comunidade e calcula uma nota de 0 a 100 conforme o
 * perfil de mobilidade do usuário. Depois reordena as rotas pela nota.
 */

function matches(location: string, target: string) {
  const a = normalize(location);
  const b = normalize(target);
  return a.length > 1 && (a.includes(b) || b.includes(a));
}

export function activeReportsFor(target: string, reports: Report[], categories?: Report['category'][]) {
  return reports.filter(
    (r) =>
      r.status === 'ativo' &&
      (!categories || categories.includes(r.category)) &&
      matches(r.location, target),
  );
}

/** Estações (únicas) usadas na rota. */
export function stationsOf(route: RouteOption) {
  return Array.from(new Set(route.steps.flatMap((s) => s.stations ?? [])));
}

/** Locais da rota que podem receber relatos: estações, pontos e ruas. */
export function placesOf(route: RouteOption) {
  const places = new Set<string>();
  route.steps.forEach((s: RouteStep) => {
    s.stations?.forEach((st) => places.add(st));
    if (s.stop) places.add(s.stop);
    if (s.mode === 'walk' && s.street) places.add(s.street);
  });
  return Array.from(places);
}

export function scoreRoute(route: RouteOption, profile: MobilityProfile, reports: Report[]): ScoredRoute {
  const wheels = profile.type === 'cadeirante' || profile.type === 'carrinho';
  const fragile = profile.type === 'gestante' || profile.type === 'idoso' || profile.type === 'temporaria';
  let score = 100;
  let blocked = false;
  const issues: string[] = [];
  const highlights: string[] = [];
  const workingElevators: string[] = [];

  // 1. Estações: escadas x elevador (considerando elevadores relatados como quebrados)
  for (const name of stationsOf(route)) {
    const info = STATIONS[name];
    if (!info) continue;
    const brokenElevator = activeReportsFor(name, reports, ['elevador']);
    const brokenEscalator = activeReportsFor(name, reports, ['escada_rolante']);
    const elevatorOk = info.hasElevator && brokenElevator.length === 0;
    const escalatorOk = info.hasEscalator && brokenEscalator.length === 0;

    if (brokenElevator.length > 0) {
      const people = brokenElevator.reduce((a, r) => a + 1 + r.confirmations.length, 0);
      issues.push(`Elevador da estação ${name} fora de serviço (relatado por ${people} pessoa${people > 1 ? 's' : ''})`);
    }

    if (elevatorOk) {
      workingElevators.push(name);
      continue;
    }

    if (wheels) {
      score -= 40;
      if (profile.type === 'cadeirante') blocked = true;
      if (!info.hasElevator) issues.push(`Estação ${name} não tem elevador`);
    } else if (profile.avoidStairs) {
      score -= escalatorOk ? 12 : 30;
      if (!info.hasElevator) {
        issues.push(
          escalatorOk
            ? `Estação ${name} sem elevador (só escada rolante)`
            : `Estação ${name} só tem escada fixa`,
        );
      } else if (escalatorOk) {
        issues.push(`Na estação ${name} será preciso usar a escada rolante`);
      }
    }
    if (!escalatorOk && brokenEscalator.length > 0) {
      issues.push(`Escada rolante da estação ${name} parada`);
    }
  }
  if (workingElevators.length > 0 && profile.preferElevator) {
    highlights.push(`Elevador funcionando em ${workingElevators.join(', ')}`);
  }

  // 2. Caminhada total
  if (route.walkMeters > profile.maxWalkMeters) {
    const excess = route.walkMeters - profile.maxWalkMeters;
    score -= Math.min(30, Math.ceil(excess / 100) * 6);
    issues.push(`${route.walkMeters} m de caminhada, acima do seu limite de ${profile.maxWalkMeters} m`);
  } else {
    highlights.push(`Só ${route.walkMeters} m de caminhada`);
  }

  // 3. Trechos a pé: ladeiras e calçadas relatadas
  for (const s of route.steps.filter((x) => x.mode === 'walk')) {
    if (s.slope === 'ingreme' && profile.avoidSteepSlopes) {
      score -= wheels ? 20 : 12;
      issues.push(`Trecho em ladeira: ${s.street}`);
    } else if (s.slope === 'moderada' && profile.avoidSteepSlopes) {
      score -= 4;
    }
    if (s.street) {
      const sidewalk = activeReportsFor(s.street, reports, ['calcada', 'rampa']);
      if (sidewalk.length > 0) {
        score -= wheels ? 25 : 15;
        issues.push(`Relato na ${s.street}: ${sidewalk[0].description}`);
      }
    }
  }

  // 4. Pontos de ônibus: banco e cobertura
  for (const s of route.steps.filter((x) => x.mode === 'bus' && x.stop)) {
    const stop = BUS_STOPS[s.stop!];
    const noCover = activeReportsFor(s.stop!, reports, ['cobertura']).length > 0 || (stop && !stop.covered);
    if (stop && !stop.hasSeats && profile.needSeat) {
      score -= 6;
      issues.push(`${s.stop} não tem banco`);
    }
    if (noCover) {
      score -= 4;
      issues.push(`${s.stop} sem cobertura`);
    }
  }

  // 5. Baldeações e tempo
  score -= route.transfers * (fragile ? 8 : 5);
  if (route.transfers === 0) highlights.push('Sem baldeação');
  score -= Math.max(0, Math.round((route.durationMin - 30) / 10));

  // 6. Banco no ponto final
  const lastRide = [...route.steps].reverse().find((s) => s.mode !== 'walk');
  const endPlace = lastRide?.stations?.[lastRide.stations.length - 1] ?? lastRide?.to;
  const endHasSeat =
    (endPlace && STATIONS[endPlace]?.hasSeats) || (endPlace && BUS_STOPS[endPlace]?.hasSeats) || false;
  if (endHasSeat) highlights.push('Ponto final tem banco');

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (blocked) score = Math.min(score, 20);

  return {
    ...route,
    score,
    blocked,
    issues,
    highlights,
    explanation: explain(route, workingElevators, issues, Boolean(endHasSeat), blocked),
  };
}

/**
 * Explicação em linguagem natural. Em produção vem do Spring AI (backend Java);
 * aqui geramos localmente com o mesmo formato para o app funcionar offline.
 */
function explain(
  route: RouteOption,
  elevators: string[],
  issues: string[],
  endHasSeat: boolean,
  blocked: boolean,
) {
  const slopes = route.steps.some((s) => s.mode === 'walk' && s.slope === 'ingreme');
  const parts: string[] = [];
  parts.push(
    `Esta rota tem ${route.walkMeters} m de caminhada ${slopes ? 'com trecho de ladeira' : 'plana'}`,
  );
  if (elevators.length > 0) parts.push(`elevador funcionando em ${elevators.join(' e ')}`);
  if (route.transfers > 0) parts.push(transfersLabel(route.transfers));
  let text = parts.join(', ') + '.';
  text += endHasSeat ? ' O ponto final tem banco.' : ' O ponto final não tem banco.';
  if (blocked) text += ' Atenção: há trecho sem acesso por elevador, inviável para cadeira de rodas.';
  else if (issues.length > 0) text += ` Fique atenta(o): ${issues[0].charAt(0).toLowerCase()}${issues[0].slice(1)}.`;
  return text;
}

/** Reordena as rotas: viáveis primeiro, maior nota, depois menor tempo. */
export function rankRoutes(routes: RouteOption[], profile: MobilityProfile, reports: Report[]) {
  return routes
    .map((r) => scoreRoute(r, profile, reports))
    .sort((a, b) => Number(a.blocked) - Number(b.blocked) || b.score - a.score || a.durationMin - b.durationMin);
}

export const MIN_ACCESSIBLE_SCORE = 50;
