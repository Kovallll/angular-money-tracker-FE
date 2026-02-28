# Мобильная оболочка (WebView) через Capacitor

Приложение собирается в WebView для Android и iOS с помощью [Capacitor](https://capacitorjs.com/).

## Требования

- Node.js, Yarn
- Для Android: [Android Studio](https://developer.android.com/studio) и Android SDK
- Для iOS (только на macOS): Xcode

## Установка зависимостей

```bash
cd frontend
yarn install
```

## Сборка веб-приложения для мобильных платформ

```bash
yarn build:mobile
```

Сборка кладёт результат в `dist/finance` (указано в `capacitor.config.ts` как `webDir`).

## Добавление нативных проектов (один раз)

Если папок `android` и `ios` ещё нет:

```bash
yarn cap:add:android
yarn cap:add:ios
```

(под капотом вызывается `npx cap add android` / `npx cap add ios`).

После этого в `frontend/` появятся проекты `android/` и `ios/`.

## Копирование веб-сборки в нативные проекты

После каждой сборки фронта нужно скопировать содержимое `dist/finance` в нативные проекты:

```bash
yarn cap:copy
```

## Запуск в среде разработки

- **Android:** `yarn cap:open:android` (откроется Android Studio; запуск приложения с устройства/эмулятора из IDE).
- **iOS:** `yarn cap:open:ios` (откроется Xcode; запуск с симулятора или устройства).

## Полный цикл после изменений во фронте

Одной командой (сборка → копирование → открытие IDE):

```bash
yarn cap:run:android   # Android
yarn cap:run:ios       # iOS (только на macOS)
```

Или по шагам:

```bash
yarn build:mobile
yarn cap:copy
yarn cap:open:android   # или cap:open:ios
```

## Backend API

Мобильное приложение обращается к тому же API, что и веб. В бэкенде уже включён CORS с `origin: '*'`, поэтому запросы из WebView (в т.ч. с `capacitor://` или локальных страниц) не блокируются. Для продакшена рекомендуется ограничить `origin` списком допустимых доменов/схем.

## Иконки приложения

Иконки для Android, iOS и PWA генерируются с помощью `@capacitor/assets`:

1. **Подготовьте исходник** — файл `frontend/assets/logo.png` минимум 1024×1024 px.
2. **Запустите генерацию:**
   ```bash
   yarn cap:icons
   ```
3. Иконки будут созданы в нативных проектах; пересоберите приложение.

Цвета фона берутся из темы приложения (#0f1d39, #0f172a). Для своей палитры добавьте флаги в `package.json` в скрипт `cap:icons`.

## Конфигурация

- `capacitor.config.ts` — appId, appName, `webDir: 'dist/finance'`.
- При необходимости укажите в `server` другой URL бэкенда или схему для нативных плагинов.

## Отладка (логин, сеть, API)

**Если при логине крутится лоадер и запрос «висит»:**

1. **Проверка URL бэкенда**  
   API берётся из `environment.apiUrl` (файл `src/environments/environment.ts`): либо `window.API_URL` (если задан в `config.js`), либо запасной `https://nest-money-tracker-be.onrender.com`. В режиме разработки в консоли для каждого запроса выводится `[API] method url` (см. `baseApiUrl.interceptor.ts`).

2. **Chrome Remote Debugging (Android)**
   - Подключите телефон по USB, включите отладку по USB.
   - В Chrome на ПК откройте `chrome://inspect`, найдите WebView вашего приложения, нажмите **inspect**.
   - Во вкладках **Console** и **Network** смотрите ошибки и фактический URL запросов (на какой адрес уходит `auth/login`).

3. **Проверка config.js**  
   В `index.html` подключается `config.js`; он может генерироваться скриптом `scripts/generate-config.js` (в `dist/finance/browser/` или рядом с `index.html`). Если файла нет, используется запасной API URL из `environment`. Убедитесь, что в сгенерированном `config.js` в `window.API_URL` указан **базовый** адрес без `/api` в конце (интерцептор сам добавляет `/api/`).

4. **Зависание из‑за Push**  
   В WebView может не быть Service Worker; тогда вызовы push (до запроса логина) могли зависать. Логин теперь не ждёт push дольше 3 секунд — после правки лоадер не должен крутиться бесконечно только из‑за push.
