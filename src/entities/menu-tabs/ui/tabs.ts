import { Component, input } from '@angular/core';
import { Items } from '../lib';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'menu-tabs',
  imports: [MatButtonModule, RouterModule, AppIconComponent, TranslatePipe],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
})
export class MenuTabsComponent {
  items = input<Items[]>([]);
}
