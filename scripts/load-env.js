/**
 * Загружает переменные из .env без зависимостей.
 * Не перезаписывает уже заданные process.env (подходит для Docker/CI).
 * Порядок: корень репозитория, затем frontend/.env, затем frontend/.env.local
 * (каждый следующий файл перекрывает предыдущий).
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
  const fromFrontendLocal = parseEnvFile(path.join(frontendDir, '.env.local'));
  const merged = { ...fromRoot, ...fromFrontend, ...fromFrontendLocal };
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

function readApiUrlFromConfigFile() {
  const configPath = path.join(frontendDir, 'src', 'config.js');
  if (!fs.existsSync(configPath)) return '';
  const text = fs.readFileSync(configPath, 'utf8');
  const match = text.match(/window\.API_URL\s*=\s*['"]([^'"]+)['"]/);
  return match?.[1] ? normalizeApiUrl(match[1]) : '';
}

function requireApiUrl() {
  loadEnv();
  const raw = process.env.API_URL;
  if (raw && String(raw).trim()) {
    return normalizeApiUrl(String(raw).trim());
  }

  // Если env не задан, оставляем URL из src/config.js
  const fromConfig = readApiUrlFromConfigFile();
  if (fromConfig) return fromConfig;

  throw new Error(
    'API_URL не задан. Укажите API_URL в env (или frontend/.env.local), либо задайте window.API_URL в frontend/src/config.js.',
  );
}

module.exports = { loadEnv, normalizeApiUrl, requireApiUrl, readApiUrlFromConfigFile };
