export interface ServerSettings {
  serverUrl: string | null,
  wifi: Wifi | null
}

export interface Wifi {
  ssid: string | null,
  password: string | null,
}
