import { Inject, Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocketSubject<any>;

  constructor(@Inject('BASE_URL') private baseUrl: string) {
    this.socket = webSocket('/ws');
  }


  // Method to subscribe to incoming messages
  public onMessage() {
    return this.socket.asObservable();
  }

}
