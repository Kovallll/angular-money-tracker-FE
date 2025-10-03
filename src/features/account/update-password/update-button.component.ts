import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'update-password-button',
  templateUrl: './update-button.component.html',
  styleUrls: ['./update-button.component.scss'],
  imports: [MatButtonModule],
})
export class UpdateProfileButtonComponent {}
