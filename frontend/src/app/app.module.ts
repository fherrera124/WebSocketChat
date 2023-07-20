import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatContentComponent } from './components/chat/chat-content/chat-content.component';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './components/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SendMessageComponent } from './components/chat/send-message/send-message.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatContentComponent,
    SendMessageComponent,
    ChatComponent,
    NavbarComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
