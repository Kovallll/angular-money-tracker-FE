import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'logout-button',
  imports: [MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './logout-button.html',
  styleUrls: ['./logout-button.scss'],
})
export class LogoutButtonComponent {
  private router = inject(Router);

  logout() {
    this.router.navigate(['/login']);
  }
}
