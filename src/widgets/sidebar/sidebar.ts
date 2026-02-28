import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SidebarMenuComponent } from './menu/ui/menu';
import { AccountComponent } from '@/entities/account/account';
import { AppLogoComponent } from '@/shared';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarMenuComponent, MatIconModule, AccountComponent, AppLogoComponent],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {}
