import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @Input() name!: String;

  constructor(
    private userService: UserService,
    private router: Router,
  ){}

  login(){
    this.userService.setUser(this.name);
    this.router.navigateByUrl("/chat");
  }

}
