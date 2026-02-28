import { Component, output } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';

@Component({
  selector: 'update-profile-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
  imports: [AppButtonComponent],
})
export class UpdateProfileButtonComponent {
  readonly updateClick = output<void>();
}
