<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUdpStore } from '@/stores/udpStore'
import UdpConfig from '@/components/udp/UdpConfig.vue'
import UdpSender from '@/components/udp/UdpSender.vue'
import UdpMessages from '@/components/udp/UdpMessages.vue'

const udpStore = useUdpStore()
const isInitialized = ref(false)

onMounted(async () => {
  if (window.electronAPI) {
    window.electronAPI.udp.onMessage((data) => {
      udpStore.addReceivedMessage(data.data, data.address, data.port, data.size)
    })
    
    window.electronAPI.udp.onError((error) => {
      console.error('UDP Error:', error)
    })
  }
  
  await udpStore.initUdp()
  isInitialized.value = true
})

onUnmounted(() => {
  udpStore.closeUdp()
})
</script>

<template>
  <div class="udp-view">
    <header class="view-header">
      <h2>UDP 协议测试</h2>
      <div class="status">
        <span class="status-indicator" :class="udpStore.isConnected ? 'status-connected' : 'status-disconnected'"></span>
        <span>{{ udpStore.isConnected ? '已连接' : '未连接' }}</span>
      </div>
    </header>
    
    <div class="view-content">
      <UdpConfig />
      <UdpSender v-if="isInitialized" @send="(msg, isHex) => udpStore.sendMessage(msg, isHex)" />
      <UdpMessages />
    </div>
  </div>
</template>

<style scoped>
.udp-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.view-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
