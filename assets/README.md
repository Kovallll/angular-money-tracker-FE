# Иконки и splash для Capacitor

Эти файлы используются инструментом `@capacitor/assets` для генерации иконок и splash-экранов для Android, iOS и PWA.

## Требования к `logo.png`

- Минимум **1024×1024 px**
- Формат PNG или JPG
- Квадратное изображение

## Генерация иконок

```bash
yarn cap:icons
```

Или вручную:

```bash
npx @capacitor/assets generate --iconBackgroundColor #0f1d39 --iconBackgroundColorDark #0f172a
```

После генерации иконки попадут в `android/app/src/main/res/` и `ios/App/App/Assets.xcassets/`.
