import { HeaderComponent } from '@/widgets/header/header';
import { SidebarComponent } from '@/widgets/sidebar/sidebar';
import { BottomTabsComponent } from '@/widgets/bottom-tabs/ui/bottom-tabs.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'main-layout',
  imports: [RouterModule, SidebarComponent, HeaderComponent, BottomTabsComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class MainLayoutComponent {}
