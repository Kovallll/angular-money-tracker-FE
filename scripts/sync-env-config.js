const fs = require('fs');
const path = require('path');
const { requireApiUrl } = require('./load-env');

const apiUrl = requireApiUrl();
const configPath = path.join(__dirname, '..', 'src', 'config.js');
const configContent = `window.API_URL = ${JSON.stringify(apiUrl)};\n`;

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('config.js:', configPath, 'API_URL:', apiUrl);
