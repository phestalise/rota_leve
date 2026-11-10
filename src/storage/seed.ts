import { scoreRoute } from '../services/accessibility';
import { fetchCandidateRoutes } from '../services/routeProvider';
import { Report, SavedRoute, User } from '../types';
import { KEYS, readJSON, writeJSON } from './base';

export const TEST_USER = {
  email: 'julia@rotaleve.com',
  password: '123456',
};

export const SECOND_TEST_USER = {
  email: 'carlos@rotaleve.com',
  password: '123456',
};

const HOUR = 3_600_000;
const ago = (h: number) => new Date(Date.now() - h * HOUR).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

const seedUsers: User[] = [
  {
    id: 'usr_julia',
    name: 'Júlia Andrade',
    email: TEST_USER.email,
    password: TEST_USER.password,
    createdAt: ago(24 * 10),
    profile: {
      type: 'gestante',
      avoidStairs: true,
      maxWalkMeters: 500,
      preferElevator: true,
      needSeat: true,
      avoidSteepSlopes: true,
    },
  },
  {
    id: 'usr_carlos',
    name: 'Carlos Lima',
    email: SECOND_TEST_USER.email,
    password: SECOND_TEST_USER.password,
    createdAt: ago(24 * 30),
    profile: {
      type: 'cadeirante',
      avoidStairs: true,
      maxWalkMeters: 800,
      preferElevator: true,
      needSeat: false,
      avoidSteepSlopes: true,
    },
  },
];

const seedReports: Report[] = [
  {
    id: 'rel_seed_se',
    userId: 'usr_carlos',
    userName: 'Carlos Lima',
    category: 'elevador',
    location: 'Estação Sé',
    description: 'Elevador do acesso Praça da Sé parado. Funcionário disse que não tem previsão de conserto.',
    createdAt: ago(20),
    expiresAt: ahead(24 * 7),
    confirmations: ['usr_ana', 'usr_marcos', 'usr_bia'],
    status: 'ativo',
  },
  {
    id: 'rel_seed_domingos',
    userId: 'usr_ana',
    userName: 'Ana Souza',
    category: 'calcada',
    location: 'Rua Domingos de Morais',
    description: 'Calçada esburacada e com raízes de árvore perto do número 900. Impossível passar com carrinho.',
    createdAt: ago(6),
    expiresAt: ahead(24 * 5),
    confirmations: ['usr_carlos'],
    status: 'ativo',
  },
  {
    id: 'rel_seed_liberdade',
    userId: 'usr_marcos',
    userName: 'Marcos Prado',
    category: 'cobertura',
    location: 'Ponto Av. Liberdade, 300',
    description: 'Cobertura do ponto foi retirada para obra. Sem abrigo de chuva nem sol.',
    createdAt: ago(3),
    expiresAt: ahead(45),
    confirmations: [],
    status: 'ativo',
  },
  {
    id: 'rel_seed_paraiso',
    userId: 'usr_bia',
    userName: 'Bia Ramos',
    category: 'escada_rolante',
    location: 'Estação Paraíso',
    description: 'Escada rolante sentido Linha 2 parada para manutenção.',
    createdAt: ago(80),
    expiresAt: ago(32),
    confirmations: [],
    status: 'expirado',
  },
  {
    id: 'rel_seed_luz',
    userId: 'usr_carlos',
    userName: 'Carlos Lima',
    category: 'rampa',
    location: 'Estação Luz',
    description: 'Rampa de acesso pela Rua José Paulino estava bloqueada por grades.',
    createdAt: ago(50),
    expiresAt: ahead(10),
    confirmations: ['usr_ana'],
    status: 'resolvido',
  },
];

/** Popula o AsyncStorage na primeira execução com usuários, relatos e uma rota salva de exemplo. */
export async function seedIfNeeded() {
  const seeded = await readJSON<boolean>(KEYS.seeded, false);
  if (seeded) return;

  const users = await readJSON<User[]>(KEYS.users, []);
  const missingUsers = seedUsers.filter((s) => !users.some((u) => u.email === s.email));
  await writeJSON(KEYS.users, [...users, ...missingUsers]);

  const reports = await readJSON<Report[]>(KEYS.reports, []);
  await writeJSON(KEYS.reports, [...reports, ...seedReports.filter((s) => !reports.some((r) => r.id === s.id))]);

  // Rota salva da Júlia passando pela Sé, para demonstrar o aviso de elevador quebrado.
  const candidates = await fetchCandidateRoutes('Tatuapé', 'Hospital São Paulo (Vila Clementino)');
  const viaSe = candidates.find((c) => c.id.endsWith('_se'));
  if (viaSe) {
    const saved: SavedRoute = {
      id: 'rot_seed_prenatal',
      userId: 'usr_julia',
      name: 'Pré-natal (casa → Hospital São Paulo)',
      route: scoreRoute(viaSe, seedUsers[0].profile!, []),
      savedAt: ago(24 * 3),
    };
    const routes = await readJSON<SavedRoute[]>(KEYS.savedRoutes, []);
    await writeJSON(KEYS.savedRoutes, [...routes.filter((r) => r.id !== saved.id), saved]);
  }

  await writeJSON(KEYS.seeded, true);
}
