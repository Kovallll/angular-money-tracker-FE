/**
 * Генерирует ngsw-config.json из шаблона, подставляя API URL из env.
 * Запускать перед ng build. API_URL — без слэша в конце (например https://api.example.com).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const templatePath = path.join(root, 'ngsw-config.template.json');
const outputPath = path.join(root, 'ngsw-config.json');

const defaultProduction = 'https://nest-money-tracker-be.onrender.com';
const defaultDev = 'http://localhost:5000';
const isProduction = process.env.NODE_ENV === 'production';

const apiOrigin = process.env.API_URL || (isProduction ? defaultProduction : defaultDev);

let template = fs.readFileSync(templatePath, 'utf8');
template = template.replace(/__API_ORIGIN__/g, apiOrigin);

fs.writeFileSync(outputPath, template, 'utf8');
console.log('ngsw-config.json generated with API_ORIGIN:', apiOrigin);
