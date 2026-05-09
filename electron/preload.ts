import { contextBridge, ipcRenderer } from 'electron'

export interface UdpApi {
  create: (port?: number) => Promise<{ success: boolean; error?: string }>
  send: (address: string, port: number, message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
  close: () => Promise<{ success: boolean; error?: string }>
  onMessage: (callback: (data: { data: string; address: string; port: number; size: number }) => void) => void
  onError: (callback: (error: string) => void) => void
}

export interface TcpApi {
  connect: (address: string, port: number) => Promise<{ success: boolean; error?: string }>
  send: (message: string, isHex?: boolean) => Promise<{ success: boolean; error?: string }>
  disconnect: () => Promise<{ success: boolean; error?: string }>
  onData: (callback: (data: { data: string; size: number }) => void) => void
  onStatus: (callback: (status: { status: string; error?: string }) => void) => void
}

const udpApi: UdpApi = {
  create: (port?: number) => ipcRenderer.invoke('udp:create', { port }),
  send: (address: string, port: number, message: string, isHex?: boolean) => 
    ipcRenderer.invoke('udp:send', { address, port, message, isHex }),
  close: () => ipcRenderer.invoke('udp:close'),
  onMessage: (callback) => {
    ipcRenderer.on('udp:on-message', (_event, data) => callback(data))
  },
  onError: (callback) => {
    ipcRenderer.on('udp:on-error', (_event, error) => callback(error))
  }
}

const tcpApi: TcpApi = {
  connect: (address: string, port: number) => ipcRenderer.invoke('tcp:connect', { address, port }),
  send: (message: string, isHex?: boolean) => ipcRenderer.invoke('tcp:send', { message, isHex }),
  disconnect: () => ipcRenderer.invoke('tcp:disconnect'),
  onData: (callback) => {
    ipcRenderer.on('tcp:on-data', (_event, data) => callback(data))
  },
  onStatus: (callback) => {
    ipcRenderer.on('tcp:on-status', (_event, status) => callback(status))
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  udp: udpApi,
  tcp: tcpApi
})
