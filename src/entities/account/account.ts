import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@/shared';
import { UserService } from '@/shared/services/user/user.service';
import { environment } from '@/environments/environment';

@Component({
  selector: 'account',
  imports: [MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
})
export class AccountComponent {
  private userService = inject(UserService);
  user = toSignal(this.userService.currentUser$, {
    initialValue: this.userService.currentUser,
  });

  avatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    const base = environment.apiUrl ?? '';
    return base ? `${base}/api${avatar.startsWith('/') ? avatar : '/' + avatar}` : avatar;
  }
}
