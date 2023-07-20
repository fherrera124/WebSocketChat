import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class IsLoggedGuard {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (!this.userService.isLogged()) {
      this.router.navigateByUrl('/login');
    }
    return true;
  }
}
