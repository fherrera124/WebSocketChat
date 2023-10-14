import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventBusService } from './_shared/event-bus.service';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';
import { StompService } from './services/stomp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatapp';
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;

  eventBusSub?: Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private eventBusService: EventBusService,
    private stompService: StompService,
  ) { }

  private errorChannelSub!: Subscription;

  ngOnInit() {

    this.errorChannelSub = this.stompService.sub({ destination: "/user/queue/errors" }).subscribe(

      msg => {
        console.error("Error: " + JSON.stringify(msg));
      }
    );

    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      /* this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR'); */

      this.username = user;
    }

    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.logout();
    });
  }

  ngOnDestroy() {
    this.errorChannelSub.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

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
