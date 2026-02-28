import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneytracker.koval.app',
  appName: 'MoneyTracker',
  webDir: 'dist/finance/browser',
  server: {
    // Для загрузки с локальных файлов (file://) запросы к API идут по сети.
    // Раскомментируйте и укажите URL бэкенда, если нужен другой origin:
    // androidScheme: 'https',
  },
};

export default config;
