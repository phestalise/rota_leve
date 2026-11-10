import { getActiveReports } from '../storage/reports';
import { getSavedRoutes } from '../storage/routes';
import { Report, SavedRoute } from '../types';
import { activeReportsFor, placesOf } from './accessibility';

export interface RouteAlert {
  saved: SavedRoute;
  reports: { place: string; report: Report }[];
}

/**
 * Versão local do consumidor RabbitMQ do backend: cruza os relatos ativos com as rotas
 * salvas do usuário e devolve os avisos ("o elevador da Sé está fora, veja esta alternativa").
 */
export async function getRouteAlerts(userId: string): Promise<RouteAlert[]> {
  const [saved, reports] = await Promise.all([getSavedRoutes(userId), getActiveReports()]);
  return saved
    .map((s) => ({
      saved: s,
      reports: placesOf(s.route).flatMap((place) =>
        activeReportsFor(place, reports).map((report) => ({ place, report })),
      ),
    }))
    .filter((a) => a.reports.length > 0);
}

export function alertMessage(place: string, report: Report) {
  switch (report.category) {
    case 'elevador':
      return `O elevador da ${place} está fora de serviço.`;
    case 'escada_rolante':
      return `A escada rolante da ${place} está parada.`;
    case 'calcada':
      return `Calçada com problema na ${place}.`;
    case 'rampa':
      return `Rampa bloqueada na ${place}.`;
    case 'cobertura':
      return `${place} está sem cobertura.`;
    default:
      return `Problema relatado em ${place}.`;
  }
}
