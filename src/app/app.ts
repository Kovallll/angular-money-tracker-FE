import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
})
export class AppComponent {}
