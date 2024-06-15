export interface WebSocketMessage {
    type: 'inventory' | 'clientCount',
    data: any
}
