import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SidebarMenuComponent } from './menu/ui/menu';
import { AccountComponent } from '@/entities/account/account';
import { LogoutButtonComponent } from '@/entities/logout-button/logout-button';
import { AppLogoComponent } from '@/shared';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarMenuComponent,
    MatIconModule,
    AccountComponent,
    LogoutButtonComponent,
    AppLogoComponent,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {}
