import { Report, ReportCategory, User } from '../types';
import { uid } from '../utils/id';
import { KEYS, readJSON, writeJSON } from './base';

const HOUR = 3_600_000;
/** Um relato vive 48h; cada confirmação garante mais 24h a partir do momento da confirmação. */
export const REPORT_TTL_HOURS = 48;
export const CONFIRMATION_EXTENSION_HOURS = 24;

/** Equivalente local da procedure que expira relatos antigos. */
function expireOld(reports: Report[]) {
  const now = Date.now();
  let changed = false;
  const result = reports.map((r) => {
    if (r.status === 'ativo' && new Date(r.expiresAt).getTime() <= now) {
      changed = true;
      return { ...r, status: 'expirado' as const };
    }
    return r;
  });
  return { result, changed };
}

export async function getReports(): Promise<Report[]> {
  const stored = await readJSON<Report[]>(KEYS.reports, []);
  const { result, changed } = expireOld(stored);
  if (changed) await writeJSON(KEYS.reports, result);
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getActiveReports() {
  return (await getReports()).filter((r) => r.status === 'ativo');
}

export async function getReport(id: string) {
  return (await getReports()).find((r) => r.id === id);
}

export async function createReport(
  user: User,
  data: { category: ReportCategory; location: string; description: string; photoUri?: string },
) {
  const reports = await readJSON<Report[]>(KEYS.reports, []);
  const now = new Date();
  const report: Report = {
    id: uid('rel'),
    userId: user.id,
    userName: user.name,
    category: data.category,
    location: data.location.trim(),
    description: data.description.trim(),
    photoUri: data.photoUri,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + REPORT_TTL_HOURS * HOUR).toISOString(),
    confirmations: [],
    status: 'ativo',
  };
  await writeJSON(KEYS.reports, [report, ...reports]);
  return report;
}

/**
 * Confirma um relato. Idempotente: o mesmo usuário não confirma duas vezes
 * e o autor não pode confirmar o próprio relato.
 */
export async function confirmReport(reportId: string, userId: string) {
  const reports = await readJSON<Report[]>(KEYS.reports, []);
  const report = reports.find((r) => r.id === reportId);
  if (!report) throw new Error('Relato não encontrado.');
  if (report.status !== 'ativo') throw new Error('Este relato não está mais ativo.');
  if (report.userId === userId) throw new Error('Você não pode confirmar o próprio relato.');
  if (report.confirmations.includes(userId)) throw new Error('Você já confirmou este relato.');

  const extended = Math.max(
    new Date(report.expiresAt).getTime(),
    Date.now() + CONFIRMATION_EXTENSION_HOURS * HOUR,
  );
  const updated: Report = {
    ...report,
    confirmations: [...report.confirmations, userId],
    expiresAt: new Date(extended).toISOString(),
  };
  await writeJSON(
    KEYS.reports,
    reports.map((r) => (r.id === reportId ? updated : r)),
  );
  return updated;
}

export async function resolveReport(reportId: string) {
  const reports = await readJSON<Report[]>(KEYS.reports, []);
  const updated = reports.map((r) => (r.id === reportId ? { ...r, status: 'resolvido' as const } : r));
  await writeJSON(KEYS.reports, updated);
}

export async function deleteReport(reportId: string) {
  const reports = await readJSON<Report[]>(KEYS.reports, []);
  await writeJSON(
    KEYS.reports,
    reports.filter((r) => r.id !== reportId),
  );
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  elevador: 'Elevador quebrado',
  escada_rolante: 'Escada rolante parada',
  calcada: 'Calçada esburacada',
  rampa: 'Rampa bloqueada / ausente',
  cobertura: 'Ponto sem cobertura',
  outro: 'Outro obstáculo',
};

export const CATEGORY_ICONS: Record<ReportCategory, string> = {
  elevador: 'arrow-up-circle',
  escada_rolante: 'git-commit',
  calcada: 'warning',
  rampa: 'trending-up',
  cobertura: 'umbrella',
  outro: 'alert-circle',
};
