import { MobilityProfile, User } from '../types';
import { normalize, uid } from '../utils/id';
import { KEYS, readJSON, removeKey, writeJSON } from './base';

export async function getUsers(): Promise<User[]> {
  return readJSON<User[]>(KEYS.users, []);
}

export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return users.find((u) => normalize(u.email) === normalize(email));
}

export async function createUser(data: { name: string; email: string; password: string }) {
  const users = await getUsers();
  if (users.some((u) => normalize(u.email) === normalize(data.email))) {
    throw new Error('Já existe uma conta com este e-mail.');
  }
  const user: User = {
    id: uid('usr'),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    createdAt: new Date().toISOString(),
  };
  await writeJSON(KEYS.users, [...users, user]);
  return user;
}

export async function updateUserProfile(userId: string, profile: MobilityProfile) {
  const users = await getUsers();
  const updated = users.map((u) => (u.id === userId ? { ...u, profile } : u));
  await writeJSON(KEYS.users, updated);
  return updated.find((u) => u.id === userId)!;
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('E-mail ou senha inválidos.');
  }
  return user;
}

export async function saveSession(userId: string) {
  await writeJSON(KEYS.session, { userId });
}

export async function getSessionUser(): Promise<User | null> {
  const session = await readJSON<{ userId: string } | null>(KEYS.session, null);
  if (!session) return null;
  const users = await getUsers();
  return users.find((u) => u.id === session.userId) ?? null;
}

export async function clearSession() {
  await removeKey(KEYS.session);
}
