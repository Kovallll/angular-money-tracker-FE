import { Component } from '@angular/core';
import { MenuTabs } from '@/entities/menu-tabs/ui/tabs';
import { menuItems } from '../lib/constants';

@Component({
  selector: 'sidebar-menu',
  imports: [MenuTabs],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
})
export class SidebarMenu {
  items = menuItems;
}
