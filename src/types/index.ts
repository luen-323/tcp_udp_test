export interface NetworkMessage {
  id: string
  type: 'send' | 'receive'
  protocol: 'UDP' | 'TCP'
  data: string
  timestamp: Date
  address?: string
  port?: number
  success: boolean
  error?: string
  size?: number
  clientId?: string
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'listening' | 'stopped'

export type TcpMode = 'client' | 'server'

export interface AppConfig {
  encoding: 'utf-8' | 'gbk' | 'ascii'
  displayMode: 'text' | 'hex'
  autoReconnect: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  timeout: number
}

export interface UdpConfig {
  address: string
  targetPort: number
  localPort: number
}

export interface TcpConfig {
  mode: TcpMode
  address: string
  port: number
}

export interface TcpServerClient {
  id: string
  address: string
  port: number
  connectedAt: Date
}

export interface TcpReceivedData {
  id: string
  data: string
  address: string
  port: number
  clientId: string
  size: number
  timestamp: Date
  isHex: boolean
}

declare global {
  interface Window {
    electronAPI: {
      udp: {
        create: (port?: number) => Promise<{ success: boolean; error?: string }>
        send: (address: string, port: number, message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
        close: () => Promise<{ success: boolean; error?: string }>
        onMessage: (callback: (data: { data: string; address: string; port: number; size: number }) => void) => void
        onError: (callback: (error: string) => void) => void
      }
      tcp: {
        connect: (address: string, port: number) => Promise<{ success: boolean; error?: string }>
        send: (message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
        disconnect: () => Promise<{ success: boolean; error?: string }>
        onData: (callback: (data: { data: string; size: number }) => void) => void
        onStatus: (callback: (status: { status: string; error?: string }) => void) => void
      }
      tcpServer: {
        start: (port: number) => Promise<{ success: boolean; error?: string }>
        send: (clientId: string, message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
        broadcast: (message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
        disconnectClient: (clientId: string) => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<{ success: boolean; error?: string }>
        onStatus: (callback: (status: { status: string; message?: string; error?: string }) => void) => void
        onClientConnect: (callback: (client: { address: string; port: number; id: string }) => void) => void
        onClientDisconnect: (callback: (client: { address: string; port: number; id: string }) => void) => void
        onData: (callback: (data: { data: string; size: number; address: string; port: number; id: string }) => void) => void
        onError: (callback: (error: { error: string; address: string; port: number; id: string }) => void) => void
      }
    }
  }
}
