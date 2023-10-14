import { Component } from '@angular/core';
import { StompService } from 'src/app/services/stomp.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css']
})
export class SendMessageComponent {

  message: string = "";
  waitingReceipt = false;

  constructor(private stompService: StompService, private storageService: StorageService) { }

  sendMessage() {
    if (this.message.trim() !== '') {
      this.waitingReceipt = true;
      this.stompService.pub("/app/chat", { from: this.storageService.getUser(), text: this.message })
        .subscribe({
          next: (receipt) => {
            if (receipt) {
              this.message = "";
            }
          },
          complete: () => this.waitingReceipt = false,
          error: (err) => this.waitingReceipt = false
        });
    }
  }

}
