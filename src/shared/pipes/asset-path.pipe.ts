import { DOCUMENT, Pipe, PipeTransform, inject } from '@angular/core';

/**
 * Преобразует относительный путь к ассету в полный от корня приложения.
 * Использование: [src]="'logo.png' | assetPath" → /assets/logo.png (или /app/assets/logo.png при base href)
 */
@Pipe({
  name: 'assetPath',
  standalone: true,
})
export class AssetPathPipe implements PipeTransform {
  private readonly document = inject(DOCUMENT);

  transform(path: string | null | undefined): string {
    if (path == null || path === '') return '';
    const base = this.document.querySelector('base')?.getAttribute('href') ?? '/';
    const baseNorm = base.endsWith('/') ? base.slice(0, -1) : base;
    const pathNorm = path.startsWith('/') ? path.slice(1) : path;
    return `${baseNorm}/assets/${pathNorm}`;
  }
}
