import { User } from '../types';
import { KEYS, readJSON, writeJSON } from './base';

export const TEST_USER = {
  email: 'julia@rotaleve.com',
  password: '123456',
};

const seedUser: User = {
  id: 'usr_julia',
  name: 'Júlia Andrade',
  email: TEST_USER.email,
  password: TEST_USER.password,
  createdAt: new Date().toISOString(),
  profile: {
    type: 'gestante',
    avoidStairs: true,
    maxWalkMeters: 500,
    preferElevator: true,
    needSeat: true,
    avoidSteepSlopes: true,
  },
};

/** Popula o AsyncStorage na primeira execução com o usuário de teste. */
export async function seedIfNeeded() {
  const seeded = await readJSON<boolean>(KEYS.seeded, false);
  if (seeded) return;

  const users = await readJSON<User[]>(KEYS.users, []);
  if (!users.some((u) => u.email === seedUser.email)) {
    await writeJSON(KEYS.users, [...users, seedUser]);
  }

  await writeJSON(KEYS.seeded, true);
}
