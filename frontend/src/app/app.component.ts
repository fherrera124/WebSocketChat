import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatapp';

  constructor(private userService: UserService, private router: Router) { }

  userName() {
    return this.userService.getUser();
  }

  save(name: String) {
    this.userService.setUser(name);
  }

  login() {
    this.router.navigateByUrl("/chat");
  }
}
