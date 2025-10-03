import { Component, input } from '@angular/core';
import { UpdateProfileButtonComponent } from '@/features/account/update-profile/update-button.component';
import { User } from '@/shared';

@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [UpdateProfileButtonComponent],
})
export class AccountComponent {
  user = input<User | null>(null);

  onFileSelected(event: Event) {}
}
