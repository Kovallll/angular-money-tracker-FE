import { Component } from '@angular/core';
import { UpdateProfileButtonComponent } from '@/features/account/update-password/update-button.component';

@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  imports: [UpdateProfileButtonComponent],
})
export class SecurityComponent {}
