import { Injectable } from '@angular/core';
import { IWatchParams, RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { OutputMessage } from '../model/output-message';

@Injectable({
    providedIn: 'root'
})
export class StompService {

    constructor() {
        this.connect();
    }

    consoledebug = false;
    stompConfig = {
        connectHeaders: {
            login: "guest",
            passcode: "guest"
        },
        brokerURL: "ws://10.16.150.154:8080/chat",
        reconnectDelay: 1000,
    };

    rxStomp!: RxStomp;
    private connect() {
        if (this.isConnected()) {
            return;
        }

        this.rxStomp = new RxStomp();
        this.rxStomp.configure(this.stompConfig);
        this.rxStomp.activate();
    }

    disconnect() {
        this.rxStomp.deactivate();
    }

    private isConnected() {
        return (this.rxStomp != null) && (this.rxStomp.connected());
    }

    pub(topic: string, data: OutputMessage) {
        this.rxStomp.publish({ destination: topic, body: JSON.stringify(data) });
    }

    sub(topic: IWatchParams): Observable<any> {
        return this.rxStomp.watch(topic);
    }
}
