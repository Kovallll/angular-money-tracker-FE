import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterModule, ToastModule, ConfirmDialog],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
})
export class AppComponent {}
