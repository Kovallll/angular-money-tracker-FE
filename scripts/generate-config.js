const fs = require('fs');
const path = require('path');

// Читаем API_URL из env или используем default
const apiUrl = process.env.API_URL || 'http://localhost:5000/api';

// Путь к папке dist
const distPath = path.join(__dirname, '../dist/finance/browser');
const configPath = path.join(distPath, 'config.js');

// Убеждаемся что папка существует
if (!fs.existsSync(distPath)) {
  console.error(`❌ Папка не найдена: ${distPath}`);
  process.exit(1);
}

// Создаём config.js
const configContent = `window.API_URL = "${apiUrl}";
console.log("API_URL configured as: ${apiUrl}");`;

try {
  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log(`✅ Config generated: ${configPath}`);
  console.log(`📡 API_URL: ${apiUrl}`);
} catch (error) {
  console.error(`❌ Ошибка при создании config.js:`, error.message);
  process.exit(1);
}
