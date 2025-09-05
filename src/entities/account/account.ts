import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'account',
  imports: [MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
})
export class Account {}
