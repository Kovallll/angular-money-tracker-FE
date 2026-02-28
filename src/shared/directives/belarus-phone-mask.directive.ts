import { Directive, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Маска телефона Беларуси: +375 (XX) XXX-XX-XX */
@Directive({
  selector: 'input[appBelarusPhoneMask]',
  standalone: true,
})
export class BelarusPhoneMaskDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  ngOnInit() {
    const val = this.el.nativeElement.value;
    if (val) this.formatAndSet(val);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.formatAndSet(value);
  }

  private formatAndSet(raw: string) {
    const digits = raw.replace(/\D/g, '');
    let normalized = digits;
    if (digits.startsWith('8') && digits.length <= 10) {
      normalized = '375' + digits.slice(1);
    } else if (digits.startsWith('80') && digits.length === 11) {
      normalized = '375' + digits.slice(2);
    } else if (!digits.startsWith('375') && digits.length > 0) {
      normalized = digits.startsWith('3') ? digits : '375' + digits;
    }
    const limited = normalized.slice(0, 12);
    const formatted = this.formatBelarus(limited);
    if (this.el.nativeElement.value !== formatted) {
      this.el.nativeElement.value = formatted;
      this.ngControl?.control?.setValue(formatted, { emitEvent: false });
    }
  }

  private formatBelarus(digits: string): string {
    if (digits.length <= 3) return digits ? `+${digits}` : '';
    const rest = digits.slice(3);
    let result = `+375 (${rest.slice(0, 2)}`;
    if (rest.length > 2) result += `) ${rest.slice(2, 5)}`;
    if (rest.length > 5) result += `-${rest.slice(5, 7)}`;
    if (rest.length > 7) result += `-${rest.slice(7, 9)}`;
    return result;
  }
}
