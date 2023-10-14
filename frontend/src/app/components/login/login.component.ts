import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  fg: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private router: Router) {
    this.fg = this.fb.group(
      {
        username: (null),
        password: (null)
      }
    )
  }

  get username() {
    return this.fg.get('username');
  }

  get password() {
    return this.fg.get('password');
  }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      //this.roles = this.storageService.getUser().roles;
    }
  }

  onSubmit(): void {
    if (this.fg.valid) {
      this.authService.login(this.username?.value, this.password?.value).subscribe({
        next: data => {
          this.storageService.storeAccessToken(data);
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          //this.roles = this.storageService.getUser().roles;
          //this.reloadPage();
          this.router.navigateByUrl('/chat');
        },
        error: err => {
          this.errorMessage = err.message;
          this.isLoginFailed = true;
          console.error("hubo un error")
        }
      });
    }

   
  }

  reloadPage(): void {
    window.location.reload();
  }
}