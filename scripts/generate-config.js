const fs = require('fs');
const path = require('path');

// Читаем API_URL из env
let apiUrl = process.env.API_URL;

console.log('🔧 Generating config...');
console.log('process.env.API_URL:', apiUrl);
console.log(
  'All env keys:',
  Object.keys(process.env).filter((k) => k.includes('API') || k.includes('api')),
);

// Базовый URL без /api в конце — интерцептор сам добавляет /api/ к путям.
if (!apiUrl) {
  console.warn('⚠️  API_URL не установлен, используем default');
  apiUrl = 'https://nest-money-tracker-be.onrender.com';
} else if (apiUrl.includes('0.0.0.0')) {
  console.warn('⚠️  API_URL содержит 0.0.0.0 (адрес сервера), это неправильно для клиента!');
  apiUrl = 'https://nest-money-tracker-be.onrender.com';
}
apiUrl = apiUrl.replace(/\/api\/?$/, '');

// Путь к папке dist
const distPath = path.join(__dirname, '../dist/finance/browser');
const configPath = path.join(distPath, 'config.js');

console.log('distPath:', distPath);
console.log('configPath:', configPath);

// Убеждаемся что папка существует
if (!fs.existsSync(distPath)) {
  console.warn(`⚠️  Папка не существует: ${distPath}, создаём...`);
  fs.mkdirSync(distPath, { recursive: true });
}

// Создаём config.js с проверкой
const configContent = `// Generated at ${new Date().toISOString()}
window.API_URL = "${apiUrl}";
if (typeof window.API_URL === 'string' && window.API_URL.length > 0) {
  console.log("✅ window.API_URL successfully set to:", window.API_URL);
} else {
  console.error("❌ window.API_URL is not properly configured!");
}`;

try {
  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log(`✅ Config successfully generated: ${configPath}`);
  console.log(`📡 API_URL value: ${apiUrl}`);
  console.log(`📝 File contents:\n${configContent}`);
} catch (error) {
  console.error(`❌ Error creating config.js:`, error.message);
  process.exit(1);
}
