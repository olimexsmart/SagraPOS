import { Inject, Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WebSocketMessage } from '../interfaces/web-socket-message';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocketSubject<WebSocketMessage>;

  constructor(@Inject('BASE_URL') private baseUrl: string) {
    if (this.baseUrl.includes('proxy')) 
      this.socket = webSocket('/ws'); // Used in dev env
    else
      this.socket = webSocket(`${this.baseUrl.replace(/^http/, 'ws')}/ws`);
  }


  // Method to subscribe to incoming messages
  public onMessage() {
    return this.socket.asObservable();
  }

}
