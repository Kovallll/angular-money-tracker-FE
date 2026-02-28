import type { CarouselResponsiveOptions } from 'primeng/carousel';

/** Breakpoints: 1920, 1440, 780 (см. shared/styles/_breakpoints.scss). */
export const DASHBOARD_CAROUSEL_RESPONSIVE: CarouselResponsiveOptions[] = [
  { breakpoint: '1920px', numVisible: 1, numScroll: 1 },
  { breakpoint: '1440px', numVisible: 1, numScroll: 1 },
  { breakpoint: '780px', numVisible: 1, numScroll: 1 },
  { breakpoint: '576px', numVisible: 1, numScroll: 1 },
];
