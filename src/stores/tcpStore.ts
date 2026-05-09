import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NetworkMessage, TcpConfig, ConnectionStatus, TcpServerClient, TcpReceivedData } from '@/types'

export const useTcpStore = defineStore('tcp', () => {
  const messages = ref<NetworkMessage[]>([])
  const receivedData = ref<TcpReceivedData[]>([])
  const status = ref<ConnectionStatus>('disconnected')
  const isLoading = ref(false)
  const mode = ref<'client' | 'server'>('client')
  const config = ref<TcpConfig>({
    mode: 'client',
    address: '127.0.0.1',
    port: 8080
  })
  const connectedClients = ref<TcpServerClient[]>([])
  const selectedClientId = ref<string | null>(null)

  const isConnected = computed(() => status.value === 'connected')
  const isListening = computed(() => status.value === 'listening')

  const connect = async () => {
    try {
      isLoading.value = true
      status.value = 'connecting'
      
      const result = await window.electronAPI.tcp.connect(
        config.value.address,
        config.value.port
      )

      if (result.success) {
        status.value = 'connected'
        const connectMessage: NetworkMessage = {
          id: Date.now().toString(),
          type: 'send',
          protocol: 'TCP',
          data: `Connected to ${config.value.address}:${config.value.port}`,
          timestamp: new Date(),
          address: config.value.address,
          port: config.value.port,
          success: true
        }
        messages.value.push(connectMessage)
      } else {
        status.value = 'error'
        const errorMessage: NetworkMessage = {
          id: Date.now().toString(),
          type: 'send',
          protocol: 'TCP',
          data: `Connection failed: ${result.error}`,
          timestamp: new Date(),
          address: config.value.address,
          port: config.value.port,
          success: false,
          error: result.error
        }
        messages.value.push(errorMessage)
      }

      return result
    } catch (error: any) {
      status.value = 'error'
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (message: string, isHex: boolean = false) => {
    try {
      const result = await window.electronAPI.tcp.send(message, isHex)

      const newMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: message,
        timestamp: new Date(),
        address: config.value.address,
        port: config.value.port,
        success: result.success,
        error: result.error
      }

      messages.value.push(newMessage)
      return result
    } catch (error: any) {
      const errorMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: message,
        timestamp: new Date(),
        address: config.value.address,
        port: config.value.port,
        success: false,
        error: error.message
      }
      messages.value.push(errorMessage)
      return { success: false, error: error.message }
    }
  }

  const addReceivedData = (data: string, size: number) => {
    const message: NetworkMessage = {
      id: Date.now().toString(),
      type: 'receive',
      protocol: 'TCP',
      data,
      timestamp: new Date(),
      address: config.value.address,
      port: config.value.port,
      success: true,
      size
    }
    messages.value.push(message)
  }

  const disconnect = async () => {
    try {
      await window.electronAPI.tcp.disconnect()
      status.value = 'disconnected'
      
      const disconnectMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: 'Disconnected from server',
        timestamp: new Date(),
        address: config.value.address,
        port: config.value.port,
        success: true
      }
      messages.value.push(disconnectMessage)
    } catch (error) {
      console.error('TCP disconnect error:', error)
    }
  }

  const startServer = async () => {
    try {
      isLoading.value = true
      
      const result = await window.electronAPI.tcpServer.start(config.value.port)

      if (result.success) {
        status.value = 'listening'
        const serverMessage: NetworkMessage = {
          id: Date.now().toString(),
          type: 'send',
          protocol: 'TCP',
          data: `Server started on port ${config.value.port}`,
          timestamp: new Date(),
          port: config.value.port,
          success: true
        }
        messages.value.push(serverMessage)
      } else {
        status.value = 'error'
        const errorMessage: NetworkMessage = {
          id: Date.now().toString(),
          type: 'send',
          protocol: 'TCP',
          data: `Server start failed: ${result.error}`,
          timestamp: new Date(),
          port: config.value.port,
          success: false,
          error: result.error
        }
        messages.value.push(errorMessage)
      }

      return result
    } catch (error: any) {
      status.value = 'error'
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const serverSend = async (message: string, isHex: boolean = false, targetClientId?: string) => {
    try {
      let result
      
      if (targetClientId) {
        result = await window.electronAPI.tcpServer.send(targetClientId, message, isHex)
      } else {
        result = await window.electronAPI.tcpServer.broadcast(message, isHex)
      }

      const newMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: message,
        timestamp: new Date(),
        port: config.value.port,
        clientId: targetClientId,
        success: result.success,
        error: result.error
      }

      messages.value.push(newMessage)
      return result
    } catch (error: any) {
      const errorMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: message,
        timestamp: new Date(),
        port: config.value.port,
        clientId: targetClientId,
        success: false,
        error: error.message
      }
      messages.value.push(errorMessage)
      return { success: false, error: error.message }
    }
  }

  const stopServer = async () => {
    try {
      await window.electronAPI.tcpServer.stop()
      status.value = 'stopped'
      connectedClients.value = []
      selectedClientId.value = null
      
      const stopMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: 'Server stopped',
        timestamp: new Date(),
        port: config.value.port,
        success: true
      }
      messages.value.push(stopMessage)
    } catch (error) {
      console.error('TCP server stop error:', error)
    }
  }

  const addServerReceivedData = (data: string, size: number, address: string, port: number, id: string) => {
    const received: TcpReceivedData = {
      id: Date.now().toString(),
      data,
      address,
      port,
      clientId: id,
      size,
      timestamp: new Date(),
      isHex: true
    }
    receivedData.value.push(received)

    const message: NetworkMessage = {
      id: received.id,
      type: 'receive',
      protocol: 'TCP',
      data,
      timestamp: new Date(),
      address,
      port,
      clientId: id,
      success: true,
      size
    }
    messages.value.push(message)
  }

  const addClient = (address: string, port: number, id: string) => {
    const client: TcpServerClient = {
      id,
      address,
      port,
      connectedAt: new Date()
    }
    connectedClients.value.push(client)
    
    const message: NetworkMessage = {
      id: Date.now().toString(),
      type: 'send',
      protocol: 'TCP',
      data: `Client connected: ${id}`,
      timestamp: new Date(),
      address,
      port,
      clientId: id,
      success: true
    }
    messages.value.push(message)
  }

  const removeClient = (id: string) => {
    const index = connectedClients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const client = connectedClients.value[index]
      connectedClients.value.splice(index, 1)
      
      if (selectedClientId.value === id) {
        selectedClientId.value = null
      }

      const message: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'TCP',
        data: `Client disconnected: ${id}`,
        timestamp: new Date(),
        address: client.address,
        port: client.port,
        clientId: id,
        success: true
      }
      messages.value.push(message)
    }
  }

  const disconnectClient = async (clientId: string) => {
    try {
      await window.electronAPI.tcpServer.disconnectClient(clientId)
      removeClient(clientId)
    } catch (error) {
      console.error('Failed to disconnect client:', error)
    }
  }

  const clearMessages = () => {
    messages.value = []
    receivedData.value = []
  }

  const updateConfig = (newConfig: Partial<TcpConfig>) => {
    config.value = { ...config.value, ...newConfig }
    if (newConfig.mode !== undefined) {
      mode.value = newConfig.mode
    }
  }

  const setStatus = (newStatus: ConnectionStatus) => {
    status.value = newStatus
  }

  const setMode = (newMode: 'client' | 'server') => {
    mode.value = newMode
    config.value.mode = newMode
  }

  return {
    messages,
    receivedData,
    status,
    isLoading,
    mode,
    config,
    connectedClients,
    selectedClientId,
    isConnected,
    isListening,
    connect,
    sendMessage,
    addReceivedData,
    disconnect,
    startServer,
    serverSend,
    stopServer,
    addServerReceivedData,
    addClient,
    removeClient,
    disconnectClient,
    clearMessages,
    updateConfig,
    setStatus,
    setMode
  }
})
