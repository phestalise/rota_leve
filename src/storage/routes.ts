import { SavedRoute, ScoredRoute } from '../types';
import { uid } from '../utils/id';
import { KEYS, readJSON, writeJSON } from './base';

async function all() {
  return readJSON<SavedRoute[]>(KEYS.savedRoutes, []);
}

export async function getSavedRoutes(userId: string) {
  return (await all())
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function getSavedRoute(id: string) {
  return (await all()).find((r) => r.id === id);
}

export async function findSavedRouteByRouteId(userId: string, routeId: string) {
  return (await all()).find((r) => r.userId === userId && r.route.id === routeId);
}

export async function saveRoute(userId: string, route: ScoredRoute, name?: string) {
  const routes = await all();
  const existing = routes.find((r) => r.userId === userId && r.route.id === route.id);
  if (existing) return existing;
  const saved: SavedRoute = {
    id: uid('rot'),
    userId,
    name: name?.trim() || `${route.origin} → ${route.destination}`,
    route,
    savedAt: new Date().toISOString(),
  };
  await writeJSON(KEYS.savedRoutes, [saved, ...routes]);
  return saved;
}

export async function deleteSavedRoute(id: string) {
  const routes = await all();
  await writeJSON(
    KEYS.savedRoutes,
    routes.filter((r) => r.id !== id),
  );
}
