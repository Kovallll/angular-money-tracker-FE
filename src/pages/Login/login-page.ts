import { InputErrorStateMatcher } from '@/shared';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: `./login-page.html`,
  styleUrl: `./login-page.scss`,
})
export class LoginPage {
  private router = inject(Router);

  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

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

  login(email: string | null, password: string | null) {
    //loginUser(email, password);
    this.router.navigate(['/dashboard']);
  }

  signup() {
    this.router.navigate(['/signup']);
  }
}
