import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private storageService: StorageService,
    private authService: AuthService) { }
  
  userName() {
    return this.storageService.getUser();
  }

  isLogged(){
    return this.storageService.isLoggedIn();
  }

  logout(){
    this.authService.logout();
  }
}
