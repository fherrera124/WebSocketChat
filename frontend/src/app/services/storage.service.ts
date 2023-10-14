import { Injectable } from '@angular/core';
import { BehaviorSubject, NEVER, of, switchMap } from 'rxjs';

const USER_KEY = 'auth-user';
const TOKEN_KEY = 'access-token';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  private onAccesTokenUpdate = new BehaviorSubject<String | null>(this.getAccessToken());


  $onAccessTokenUpdate = this.onAccesTokenUpdate.pipe(
    switchMap((token) => {
      if (token == null) { // BehaviorSubject devolvió el valor por
        // defecto. switchMap se subscribirá al siguiente observable
        // interno, que nunca emite, por ende, en el observable de salida,
        // el operador no tendrá valor que retransmitirle
        return NEVER;
      }
      // BehaviorSubject volvió a emitir, entonces switchMap se desuscribió
      // del anterior observable interno, y se suscribirá a este nuevo, que
      // emite el token en el instante que el operador se suscriba, y este
      // a su vez lo retransmite al observable de salida
      return of(token);
    })
  );

  public clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(data: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, data);
  }

  public storeAccessToken(data: any) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, data.access_token);
    this.onAccesTokenUpdate.next(data.access_token);
  }

  public getUser(): string {
    const user = window.sessionStorage.getItem(USER_KEY);
    return user ? user : "";
  }

  public getAccesToken(): string {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    return token ? token : "";
  }

  public isLoggedIn(): boolean {
    return window.sessionStorage.getItem(USER_KEY) != null;
  }

  private getAccessToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }
}