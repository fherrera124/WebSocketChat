import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private userService: UserService) { }
  
  userName() {
    return this.userService.getUser();
  }

  isLogged(){
    return this.userService.isLogged();
  }

  logout(){
    this.userService.logout();
  }
}
