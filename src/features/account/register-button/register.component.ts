import { User, UserService } from '@/shared';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'register-button',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [MatButtonModule],
  standalone: true,
})
export class RegisterButtonComponent {
  private router = inject(Router);
  user = input<User | null>(null);

  constructor(private userService: UserService) {}

  onRegister() {
    //createUser(name, email, password);
    if (
      !this.user()?.email ||
      !this.user()?.name ||
      !this.user()?.lastname ||
      !this.user()?.phone
    ) {
      throw new Error('Email and password are required');
    }
    this.userService.setUser(this.user()!);
    this.router.navigate(['/login']);
  }
}
