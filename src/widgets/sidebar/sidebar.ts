import { Component } from '@angular/core';
import { SidebarMenu } from './menu/ui/menu';
import { MatIconModule } from '@angular/material/icon';
import { LogoutButton } from '@/entities/logout-button/logout-button';
import { Account } from '@/entities/account/account';
@Component({
  selector: 'app-sidebar',
  imports: [SidebarMenu, MatIconModule, LogoutButton, Account],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  logout() {}
}
