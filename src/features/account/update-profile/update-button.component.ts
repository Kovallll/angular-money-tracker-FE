import { Component, output } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'update-profile-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
  imports: [AppButtonComponent, TranslateModule],
})
export class UpdateProfileButtonComponent {
  readonly updateClick = output<void>();
}
