import { Injectable, signal } from '@angular/core';
import { TranslationObject, TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'app_lang';
const SUPPORTED = ['ru', 'en'] as const;
type Lang = (typeof SUPPORTED)[number];

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly currentLang = signal<Lang>('ru');

  constructor(private readonly translate: TranslateService) {}

  async init(): Promise<void> {
    const [ru, en] = await Promise.all([this.loadTranslations('ru'), this.loadTranslations('en')]);
    this.translate.setTranslation('ru', ru, true);
    this.translate.setTranslation('en', en, true);
    this.translate.addLangs([...SUPPORTED]);
    this.translate.setDefaultLang('en');
    const stored = localStorage.getItem(STORAGE_KEY);
    const browser = this.translate.getBrowserLang();
    const candidate = (stored || browser || 'ru').toLowerCase();
    this.setLanguage(this.isSupported(candidate) ? candidate : 'ru');
  }

  setLanguage(lang: string): void {
    const normalized: Lang = this.isSupported(lang) ? lang : 'ru';
    this.translate.use(normalized);
    this.currentLang.set(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLang() === 'ru' ? 'en' : 'ru');
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private isSupported(lang: string): lang is Lang {
    return SUPPORTED.includes(lang as Lang);
  }

  private async loadTranslations(lang: Lang): Promise<TranslationObject> {
    const response = await fetch(`./assets/i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    return (await response.json()) as TranslationObject;
  }
}
