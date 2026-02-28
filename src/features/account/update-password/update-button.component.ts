import { Component } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';

@Component({
  selector: 'update-password-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
  imports: [AppButtonComponent],
})
export class UpdateProfileButtonComponent {}
