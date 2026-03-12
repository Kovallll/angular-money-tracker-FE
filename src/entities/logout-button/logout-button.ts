import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/shared/services/auth/auth.service';
import { ConfirmationService } from 'primeng/api';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'logout-button',
  imports: [AppButtonComponent, RouterModule, AppIconComponent],
  templateUrl: './logout-button.html',
  styleUrls: ['./logout-button.scss'],
})
export class LogoutButtonComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);

  logout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to sign out?',
      header: 'Sign out',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Sign out',
      rejectLabel: 'Cancel',
      accept: () => this.doLogout(),
    });
  }

  private async doLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
