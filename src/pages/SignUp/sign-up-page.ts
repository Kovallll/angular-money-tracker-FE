import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RegisterButtonComponent } from '@/features/account/register-button/register.component';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RegisterButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: `./sign-up-page.scss`,
  standalone: true,
})
export class SignUpPageComponent {
  public form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    lastname: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    phone: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)],
      nonNullable: true,
    }),
  });

  getErrorEmailMessage() {
    const emailCtrl = this.form.controls['email'];
    if (emailCtrl.hasError('required')) {
      return 'Required field';
    }
    if (emailCtrl.hasError('email')) {
      return 'Invalid email';
    }
    return '';
  }

  getErrorNameMessage() {
    const name = this.form.controls['name'];
    if (name.hasError('required')) {
      return 'Required field';
    }

    return '';
  }

  getErrorLastnameMessage() {
    const lastname = this.form.controls['lastname'];
    if (lastname.hasError('required')) {
      return 'Required field';
    }

    return '';
  }

  getErrorPasswordMessage() {
    const password = this.form.controls['password'];
    if (password.hasError('required')) {
      return 'Required field';
    }
    if (password.hasError('minlength')) {
      return 'Password must be at least 4 characters';
    }
    return '';
  }
}
