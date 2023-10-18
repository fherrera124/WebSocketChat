import { Injectable } from '@angular/core';
import { IFrame, IWatchParams, RxStomp, RxStompState, StompHeaders } from '@stomp/rx-stomp';
import { EMPTY, Observable, exhaustMap, filter, firstValueFrom, from, map, race, take } from 'rxjs';
import { OutputMessage } from '../model/output-message';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { XSRFTokenService } from './xsrf.service';


export interface Token {
    access_token: string,
    message: string
}

@Injectable({
    providedIn: 'root'
})
export class StompService {

    constructor(
        private storageService: StorageService,
        private xsrfService: XSRFTokenService,
        private authService: AuthService,) {

        this.rxStomp = new RxStomp();
        this.rxStomp.configure({
            brokerURL: "ws://localhost:8090/app/secured/chat",
            reconnectDelay: 10000,
            beforeConnect: (mainStompCLient: RxStomp): Promise<void> => {

                return firstValueFrom(this.storageService.$onAccessTokenUpdate)
                    .catch(
                        (err) => console.warn("Fallo la conexion: " + JSON.stringify(err))
                    )
                    .then(
                        (token) => {
                            mainStompCLient.stompClient.connectHeaders = { 'X-XSRF-TOKEN': this.xsrfService.getXsrfToken()!, Authorization: `Bearer ${token}` };
                        }
                    );
            }
        });
        this.rxStomp.activate();

        ///////// Observables //////////
        // emits when rxStomp state changed to CLOSED
        this.disconnected$ = this.rxStomp.connectionState$.pipe(
            filter((currentState: RxStompState) => currentState === RxStompState.CLOSED)
        );

        this.tokenRefreshed$ = this.rxStomp.stompErrors$.pipe(
            filter((err) => err.body == "Invalid access token"),
            exhaustMap(() => this.authService.refreshToken())
        );

        ////////// subscriptions //////////

        this.disconnected$.subscribe(() => {
            console.warn("Desconectado");
            this.connected = false;
        });
        this.tokenRefreshed$.subscribe(
            {
                next: () => console.warn("access token refreshed"),
                error: (err) => console.warn("Error refrescando access token")
            });

        // set webSocketError flag on websocket error event
        this.rxStomp.webSocketErrors$.subscribe((err: Event) => {
            console.warn("Error websocket: " + JSON.stringify(err.type))
        });

        // subscription to reconnection established events
        this.rxStomp.connected$.subscribe(() => {
            console.warn("Conectado");
            this.connected = true;
        });

        // ERROR frames event subscription
        this.rxStomp.stompErrors$.subscribe(err => console.warn("Error stomp: " + err.body));

    }

    connected: boolean = false;

    rxStomp: RxStomp;

    connect() {
        this.rxStomp.activate();
    }

    disconnected$: Observable<RxStompState>;
    tokenRefreshed$: Observable<Object | undefined>;

    private randomText(size: number) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let cadenaAleatoria = '';

        for (let i = 0; i < size; i++) {
            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
        }

        return cadenaAleatoria;
    }

    pub(topic: string, data: OutputMessage): Observable<boolean> {

        if (!this.connected) {
            return EMPTY;
        }

        // generate random receipt id to send as header
        const receiptId = this.randomText(10);
        const headers: StompHeaders = { 'X-XSRF-TOKEN': this.xsrfService.getXsrfToken()!, receipt: receiptId };
        this.rxStomp.publish({ destination: topic, body: JSON.stringify(data), headers });

        const asyncReceipt: Promise<IFrame> = this.rxStomp.asyncReceipt(receiptId);
        // promise transformed to observable
        const receipt$ = from(asyncReceipt).pipe(map(() => true)); // message delivered: broker sent a RECEIPT frame matching receipt-id
        /* const receipt$ = this.rxStomp.unhandledReceipts$.pipe(
            filter(frame => frame.headers['receipt-id'] === receiptId),
            map(() => true)
        ); */
        const disconnect$ = this.disconnected$.pipe(map(() => false)); // message not delivered: a disconnect event arrived first

        return race(receipt$, disconnect$).pipe(take(1)); // emit true or false, then complete
    }

    sub(topic: IWatchParams): Observable<any> {
        const subHeaders = () => {
            return { 'X-XSRF-TOKEN': this.xsrfService.getXsrfToken()! };
        };
        return this.rxStomp.watch({ ...topic, subHeaders });
    }
}
