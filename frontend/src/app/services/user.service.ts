import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user : String = "";

  constructor(private router: Router) { }

  setUser(name: String) {
    this.user = name;
  }

  getUser() {
    return this.user;
  }

  isLocalUser(user: String) {
    return this.user == user;
  }

  isLogged(){
    return this.user != "";
  }

  logout(){
    this.user = "";
    this.router.navigateByUrl("/login");
  }
}
