// app.component.ts (standalone)
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ParcelComponent } from 'single-spa-angular/parcel';
import { mountRootParcel } from 'single-spa';
import { config } from './@widgets/datepicker';
@Component({
  selector: 'date-picker',
  standalone: true,
  imports: [ParcelComponent],
  templateUrl: './date-picker.component.html',
})
export class AppComponent {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  mountParcel = mountRootParcel;
  config = config;

  customProps = {
    // Любые твои CalendarProps:
    initialYear: 2025,
    initialMonth: 10,
    isWithInput: true,
    isWithRange: true,
    isWithMinMax: true,
    minDate: '2025-01-01',
    maxDate: '2025-12-31',
    onChange: (d: Date) => console.log('changed', d),
  };
}
