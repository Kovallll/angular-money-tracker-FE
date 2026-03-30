import { Capacitor } from '@capacitor/core';

/** Синхронизировать таб/состояние с URL только вне нативного WebView. */
export function shouldSyncTabToUrl(): boolean {
  try {
    return !Capacitor.isNativePlatform();
  } catch {
    return true;
  }
}
