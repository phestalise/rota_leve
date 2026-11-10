export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

export function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'expirado';
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 24) return `expira em ${Math.floor(hours / 24)}d ${hours % 24}h`;
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `expira em ${hours}h ${minutes}min`;
}

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
