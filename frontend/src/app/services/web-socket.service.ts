import { Inject, Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WebSocketMessage } from '../interfaces/web-socket-message';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocketSubject<WebSocketMessage>;

  constructor(@Inject('BASE_URL') private baseUrl: string) {
    this.socket = webSocket(`${this.baseUrl.replace(/^http/, 'ws')}/ws`);
  }


  // Method to subscribe to incoming messages
  public onMessage() {
    return this.socket.asObservable();
  }

}
