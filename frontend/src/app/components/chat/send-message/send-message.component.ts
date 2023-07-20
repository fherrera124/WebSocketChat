import { Component } from '@angular/core';
import { StompService } from 'src/app/services/stomp.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent {

  message: string = "";

  constructor(private stompService: StompService, private userService: UserService) { }

  sendMessage() {
    if (this.message.trim() !== '') {
      this.stompService.pub("/app/chat", { from: this.userService.getUser(), text: this.message });
    }
    this.message = "";
  }

}
