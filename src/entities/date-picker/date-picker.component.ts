// app.component.ts (standalone)
import { Component, ViewChild, ElementRef, input, output } from '@angular/core';
import { ParcelComponent } from 'single-spa-angular/parcel';
import { mountRootParcel } from 'single-spa';

@Component({
  selector: 'date-picker',
  standalone: true,
  imports: [ParcelComponent],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  isWithRange = input(false);
  dateEmmit = output();
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  mountParcel = mountRootParcel;
  async config() {
    return (window as any).System.import('@spatest/date-picker');
  }

  customProps = {
    initialYear: 2025,
    initialMonth: 10,
    isWithInput: true,
    isWithRange: this.isWithRange(),
    isWithMinMax: true,
    minDate: '2025-01-01',
    maxDate: '2025-12-31',
    onChangeData: (d: any) => {
      this.dateEmmit.emit(d);
    },
    bgColor: '#0f1d39',
  };
}
