import { Component } from '@angular/core';
import { MenuTabsComponent } from '@/entities/menu-tabs/ui/tabs';
import { menuItems } from '../lib/constants';

@Component({
  selector: 'sidebar-menu',
  imports: [MenuTabsComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
})
export class SidebarMenuComponent {
  items = menuItems;
}
