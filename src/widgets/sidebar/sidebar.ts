import { Component } from '@angular/core';
import { SidebarMenuComponent } from './menu/ui/menu';
import { MatIconModule } from '@angular/material/icon';
import { LogoutButtonComponent } from '@/entities/logout-button/logout-button';
import { AccountComponent } from '@/entities/account/account';
import { AssetUrlPipe } from '@/shared';
@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarMenuComponent,
    MatIconModule,
    LogoutButtonComponent,
    AccountComponent,
    AssetUrlPipe,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {}
