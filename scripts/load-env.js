/**
 * Загружает переменные из .env без зависимостей.
 * Не перезаписывает уже заданные process.env (подходит для Docker/CI).
 * Порядок: корень репозитория, затем frontend/.env (перекрывает при совпадении ключей).
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const frontendDir = path.join(__dirname, '..');

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadEnv() {
  const fromRoot = parseEnvFile(path.join(rootDir, '.env'));
  const fromFrontend = parseEnvFile(path.join(frontendDir, '.env'));
  const merged = { ...fromRoot, ...fromFrontend };
  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function normalizeApiUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

function requireApiUrl() {
  loadEnv();
  const raw = process.env.API_URL;
  if (!raw || !String(raw).trim()) {
    throw new Error(
      'API_URL не задан. Укажите в .env в корне проекта или в frontend/.env, либо в переменных окружения.',
    );
  }
  return normalizeApiUrl(String(raw).trim());
}

module.exports = { loadEnv, normalizeApiUrl, requireApiUrl };
