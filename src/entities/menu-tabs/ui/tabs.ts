import { Component, input } from '@angular/core';
import { Items } from '../lib';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'menu-tabs',
  imports: [MatButtonModule, RouterModule, AppIconComponent],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
})
export class MenuTabsComponent {
  items = input<Items[]>([]);
}
