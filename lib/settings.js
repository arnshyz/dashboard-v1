import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const SETTINGS_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

const defaultSettings = {
  pageTitle: 'AKAY Sales Dashboard',
  description: 'Pantau performa penjualan AKAY Digital Nusantara secara real-time.',
  users: [],
};

async function ensureSettingsFile() {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
  }
}

function normaliseUsers(users) {
  if (!Array.isArray(users)) return [];
  const seen = new Set();
  return users
    .map((user) => {
      if (!user || typeof user !== 'object') return null;
      const username = String(user.username || '').trim();
      if (!username) return null;
      if (seen.has(username.toLowerCase())) return null;
      seen.add(username.toLowerCase());
      const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';
      const salt = typeof user.salt === 'string' ? user.salt : '';
      const createdAt = user.createdAt || new Date().toISOString();
      if (!passwordHash || !salt) return null;
      return { username, passwordHash, salt, createdAt };
    })
    .filter(Boolean);
}

function normaliseSettings(raw) {
  const base = { ...defaultSettings, ...(raw && typeof raw === 'object' ? raw : {}) };
  base.pageTitle = String(base.pageTitle || defaultSettings.pageTitle).slice(0, 150);
  base.description = String(base.description || defaultSettings.description).slice(0, 500);
  base.users = normaliseUsers(base.users);
  return base;
}

async function readSettings() {
  await ensureSettingsFile();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    return normaliseSettings(parsed);
  } catch (error) {
    console.error('Failed to read settings, using defaults', error);
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
    return { ...defaultSettings };
  }
}

async function writeSettings(nextSettings) {
  const normalised = normaliseSettings(nextSettings);
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(normalised, null, 2), 'utf8');
  return normalised;
}

function omitSensitive(settings) {
  return {
    pageTitle: settings.pageTitle,
    description: settings.description,
    users: settings.users.map((user) => ({ username: user.username, createdAt: user.createdAt })),
  };
}

export async function getSecureSettings() {
  const settings = await readSettings();
  return omitSensitive(settings);
}

export async function getPublicSettings() {
  const settings = await readSettings();
  return {
    pageTitle: settings.pageTitle,
    description: settings.description,
  };
}

function createPasswordHash(password, salt) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export async function verifyUserCredentials(username, password) {
  if (!username || !password) return false;
  const settings = await readSettings();
  const user = settings.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return false;
  const { hash } = createPasswordHash(password, user.salt);
  return hash === user.passwordHash;
}

export async function updateGeneralSettings({ pageTitle, description }) {
  const current = await readSettings();
  if (typeof pageTitle === 'string') current.pageTitle = pageTitle.trim().slice(0, 150);
  if (typeof description === 'string') current.description = description.trim().slice(0, 500);
  const saved = await writeSettings(current);
  return omitSensitive(saved);
}

export async function addUser({ username, password }) {
  const cleanUsername = typeof username === 'string' ? username.trim() : '';
  if (!cleanUsername) {
    throw new Error('Username wajib diisi');
  }
  if (!password || password.length < 6) {
    throw new Error('Password minimal 6 karakter');
  }
  const settings = await readSettings();
  const exists = settings.users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase());
  if (exists) {
    throw new Error('Username sudah digunakan');
  }
  const { hash, salt } = createPasswordHash(password);
  const newUser = {
    username: cleanUsername,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };
  settings.users.push(newUser);
  const saved = await writeSettings(settings);
  return omitSensitive(saved);
}

export function getEnvUser() {
  const username = process.env.ADMIN_UI_USER || 'admin';
  const password = process.env.ADMIN_UI_PASSWORD || '';
  return { username, hasPassword: Boolean(password) };
}
