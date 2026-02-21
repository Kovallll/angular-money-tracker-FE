import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SidebarMenuComponent } from './menu/ui/menu';
import { LogoutButtonComponent } from '@/entities/logout-button/logout-button';
import { AccountComponent } from '@/entities/account/account';
import { AssetPathPipe } from '@/shared/pipes/asset-path.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarMenuComponent,
    MatIconModule,
    LogoutButtonComponent,
    AccountComponent,
    AssetPathPipe,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {}
