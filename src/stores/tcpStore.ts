import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NetworkMessage, TcpConfig, ConnectionStatus } from '@/types'

export const useTcpStore = defineStore('tcp', () => {
  const messages = ref<NetworkMessage[]>([])
  const status = ref<ConnectionStatus>('disconnected')
  const isLoading = ref(false)
  const config = ref<TcpConfig>({
    address: '127.0.0.1',
    port: 8080
  })

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

  const clearMessages = () => {
    messages.value = []
  }

  const updateConfig = (newConfig: Partial<TcpConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  const setStatus = (newStatus: ConnectionStatus) => {
    status.value = newStatus
  }

  return {
    messages,
    status,
    isLoading,
    config,
    connect,
    sendMessage,
    addReceivedData,
    disconnect,
    clearMessages,
    updateConfig,
    setStatus
  }
})
