// src/app/pages/signup/sign-up-page.component.ts
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/shared/services/auth/auth.service';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
})
export class SignUpPageComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
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
      validators: [Validators.required, Validators.minLength(4)],
      nonNullable: true,
    }),
  });

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Required field';
    if (controlName === 'email' && control.hasError('email')) return 'Invalid email';
    if (controlName === 'password' && control.hasError('minlength')) return 'Min 4 characters';

    return '';
  }

  async onRegister() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { name, email, password } = this.form.value;

    try {
      await this.authService.register(email!, password!, name!);

      this.snackBar.open('✅ Registration successful! Please login.', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.snackBar.open(`❌ ${error.message || 'Registration failed'}`, 'Close', {
        duration: 5000,
      });
    } finally {
      this.loading = false;
    }
  }
}
