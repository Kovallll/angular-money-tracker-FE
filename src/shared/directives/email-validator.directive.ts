import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { emailValidator } from '../validators/email.validator';

/** Директива-валидатор email для template-driven форм. */
@Directive({
  selector: 'input[appEmailValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true }],
})
export class EmailValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return emailValidator(control);
  }
}
