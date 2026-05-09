import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NetworkMessage, UdpConfig } from '@/types'

export const useUdpStore = defineStore('udp', () => {
  const messages = ref<NetworkMessage[]>([])
  const isConnected = ref(false)
  const isLoading = ref(false)
  const config = ref<UdpConfig>({
    address: '127.0.0.1',
    targetPort: 8080,
    localPort: 0
  })

  const initUdp = async () => {
    try {
      isLoading.value = true
      const result = await window.electronAPI.udp.create(config.value.localPort)
      isConnected.value = result.success
      
      if (!result.success && result.error) {
        console.error('UDP init error:', result.error)
      }
    } catch (error) {
      console.error('UDP init error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (message: string, isHex: boolean = false) => {
    try {
      const result = await window.electronAPI.udp.send(
        config.value.address,
        config.value.targetPort,
        message,
        isHex
      )

      const newMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'UDP',
        data: message,
        timestamp: new Date(),
        address: config.value.address,
        port: config.value.targetPort,
        success: result.success,
        error: result.error
      }

      messages.value.push(newMessage)
      return result
    } catch (error: any) {
      const errorMessage: NetworkMessage = {
        id: Date.now().toString(),
        type: 'send',
        protocol: 'UDP',
        data: message,
        timestamp: new Date(),
        address: config.value.address,
        port: config.value.targetPort,
        success: false,
        error: error.message
      }
      messages.value.push(errorMessage)
      return { success: false, error: error.message }
    }
  }

  const addReceivedMessage = (data: string, address: string, port: number, size: number) => {
    const message: NetworkMessage = {
      id: Date.now().toString(),
      type: 'receive',
      protocol: 'UDP',
      data,
      timestamp: new Date(),
      address,
      port,
      success: true,
      size
    }
    messages.value.push(message)
  }

  const closeUdp = async () => {
    try {
      await window.electronAPI.udp.close()
      isConnected.value = false
    } catch (error) {
      console.error('UDP close error:', error)
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  const updateConfig = (newConfig: Partial<UdpConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    messages,
    isConnected,
    isLoading,
    config,
    initUdp,
    sendMessage,
    addReceivedMessage,
    closeUdp,
    clearMessages,
    updateConfig
  }
})
