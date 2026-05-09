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
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

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
  address: string
  port: number
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
    }
  }
}
