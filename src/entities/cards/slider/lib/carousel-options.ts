import type { CarouselResponsiveOptions } from 'primeng/carousel';

/** Один слайд виден, листаем по одному. Адаптивно под любой размер контейнера. */
export const DASHBOARD_CAROUSEL_RESPONSIVE: CarouselResponsiveOptions[] = [
  { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
  { breakpoint: '992px', numVisible: 1, numScroll: 1 },
  { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  { breakpoint: '576px', numVisible: 1, numScroll: 1 },
];
