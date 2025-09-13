import { Component, inject, input } from '@angular/core';
import { Items } from '../lib';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'menu-tabs',
  imports: [MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
})
export class MenuTabsComponent {
  items = input<Items[]>([]);
}
