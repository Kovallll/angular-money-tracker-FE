// src/app/pages/signup/sign-up-page.component.ts
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/shared/services/auth/auth.service';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
    AssetPathPipe,
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
      validators: [Validators.required, Validators.email],
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
