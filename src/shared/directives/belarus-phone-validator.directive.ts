import { Directive, inject } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { belarusPhoneValidator } from '../validators/belarus-phone.validator';

/** Директива-валидатор телефона Беларуси для template-driven форм. */
@Directive({
  selector: 'input[appBelarusPhoneMask]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: BelarusPhoneValidatorDirective, multi: true }],
})
export class BelarusPhoneValidatorDirective implements Validator {
  private _validatorFn = belarusPhoneValidator;

  validate(control: AbstractControl): ValidationErrors | null {
    return this._validatorFn(control);
  }
}
