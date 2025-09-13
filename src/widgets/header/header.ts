import { UserService } from '@/features/user/user.service';
import { User } from '@/shared';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  host: { class: 'container' },
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  date = new Date().toLocaleDateString();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.getUser();
  }
}
