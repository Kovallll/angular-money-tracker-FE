import { InputErrorStateMatcher } from '@/shared';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: `./sign-up-page.scss`,
})
export class SignUpPage {
  private router = inject(Router);

  name = new FormControl('', [Validators.required]);
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

  register(name: string | null, email: string | null, password: string | null) {
    //createUser(name, email, password);
    this.router.navigate(['/login']);
  }
}
