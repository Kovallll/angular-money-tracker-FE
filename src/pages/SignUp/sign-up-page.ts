// src/app/pages/signup/sign-up-page.component.ts
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/shared/services/auth/auth.service';
import {
  AppLogoComponent,
  emailValidator,
  BelarusPhoneMaskDirective,
  BelarusPhoneValidatorDirective,
} from '@/shared';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [
    CommonModule,
    AppButtonComponent,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    AppLogoComponent,
    BelarusPhoneMaskDirective,
    BelarusPhoneValidatorDirective,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
})
export class SignUpPageComponent {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  loading = false;

  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    lastname: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    email: new FormControl('', {
      validators: [Validators.required, emailValidator],
      nonNullable: true,
    }),
    phone: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true,
    }),
  });

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Required field';
    if (controlName === 'email' && control.hasError('email')) return 'Invalid email';
    if (controlName === 'phone' && control.hasError('belarusPhone'))
      return 'Enter valid Belarus phone: +375 (XX) XXX-XX-XX';
    if (controlName === 'password' && control.hasError('minlength')) return 'Min 6 characters';

    return '';
  }

  async onRegister() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { name, lastname, email, phone, password } = this.form.value;

    try {
      await this.authService.register(email!, password!, name!, lastname ?? '', phone ?? '');
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Success',
        detail: 'Registration successful. Please sign in.',
        life: 4000,
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.messageService.add({
        key: 'toast',
        severity: 'error',
        summary: 'Registration failed',
        detail: error?.error?.message ?? error?.message ?? 'Please try again.',
        life: 5000,
      });
    } finally {
      this.loading = false;
    }
  }
}
