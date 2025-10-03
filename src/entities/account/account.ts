import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@/shared';
import { UserService } from '@/shared/services/user/user.service';

@Component({
  selector: 'account',
  imports: [MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
})
export class AccountComponent implements OnInit {
  user: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.getUser();
  }
}
