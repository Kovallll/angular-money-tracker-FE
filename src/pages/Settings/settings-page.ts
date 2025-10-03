import { Component } from '@angular/core';
import { SettingsTabsComponent } from '@/widgets/settingsTabs/setting-tabs.component';

@Component({
  selector: 'settings-page',
  imports: [SettingsTabsComponent],
  templateUrl: './settings-page.html',
  styleUrl: `./settings-page.scss`,
})
export class SettingsPageComponent {}
