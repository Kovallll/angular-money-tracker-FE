import { InputErrorStateMatcher } from '@/shared';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/shared/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterLink],
  templateUrl: `./login-page.html`,
  styleUrl: `./login-page.scss`,
})
export class LoginPageComponent {
  private router = inject(Router);

  loading = false;
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(4)]);
  constructor(private authService: AuthService) {}

  getErrorEmailMessage() {
    if (this.email.hasError('required')) {
      return 'Required field';
    }
    if (this.email.hasError('email')) {
      return 'Invalid email';
    }
    return '';
  }

  getErrorPasswordMessage() {
    if (this.password.hasError('required')) {
      return 'Required field';
    }
    if (this.password.hasError('minlength')) {
      return 'Password must be at least 4 characters';
    }
    return '';
  }

  matcher = new InputErrorStateMatcher();

  async login() {
    if (this.email.invalid || this.password.invalid) return;

    this.loading = true;

    try {
      await this.authService.login(this.email.value!, this.password.value!);

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  signup() {
    this.router.navigate(['/signup']);
  }
}
