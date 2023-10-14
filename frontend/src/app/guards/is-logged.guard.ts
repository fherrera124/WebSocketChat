import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class IsLoggedGuard {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
    return true;
  }
}
