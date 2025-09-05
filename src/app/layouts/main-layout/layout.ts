import { Sidebar } from '@/widgets/sidebar/sidebar';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'main-layout',
  imports: [RouterModule, Sidebar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class MainLayout {}
