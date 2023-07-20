import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMessage } from '@stomp/rx-stomp';
import { Subscription } from 'rxjs';
import { Message } from '../../../model/message';
import { StompService } from '../../../services/stomp.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html',
  styleUrls: ['./chat-content.component.css']
})
export class ChatContentComponent implements OnInit, OnDestroy {


  @ViewChild('container')
  container: any;

  scrollToBottom = () => {
    try {
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    } catch (err) { }
  }

  messages: Message[] = [
    /*{
      from: "Pepe",
      text: "Hola, como estas?",
      time: "12:30"
    }*/
  ];
  private topicSubscription!: Subscription;

  lastUser: String = "";

  constructor(private stompService: StompService, private userService: UserService) { }

  ngOnInit() {
    this.topicSubscription = this.stompService.sub({ destination: "/topic/messages" }).subscribe((message: IMessage) => {

      let msg: Message = JSON.parse(message.body);

      msg.cont = msg.from == this.lastUser;

      this.messages.push(msg);

      this.lastUser = msg.from;

      // https://stackoverflow.com/a/68826529
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
    );
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
  }

  clickDisconnect() {
    this.stompService.disconnect();
  }

  isLocalUser(user: String): boolean {
    return this.userService.isLocalUser(user);
  }

}
