<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'
import TcpConfig from '@/components/tcp/TcpConfig.vue'
import TcpSender from '@/components/tcp/TcpSender.vue'
import TcpMessages from '@/components/tcp/TcpMessages.vue'

const tcpStore = useTcpStore()
const isInitialized = ref(false)

onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.tcp.onData((data) => {
      tcpStore.addReceivedData(data.data, data.size)
    })
    
    window.electronAPI.tcp.onStatus((statusData) => {
      const statusMap: Record<string, any> = {
        'connected': 'connected',
        'disconnected': 'disconnected',
        'error': 'error',
        'connecting': 'connecting'
      }
      tcpStore.setStatus(statusMap[statusData.status] || 'disconnected')
    })
  }
  
  isInitialized.value = true
})

onUnmounted(() => {
  tcpStore.disconnect()
})
</script>

<template>
  <div class="tcp-view">
    <header class="view-header">
      <h2>TCP 协议测试</h2>
      <div class="status">
        <span class="status-indicator" :class="{
          'status-connected': tcpStore.status === 'connected',
          'status-disconnected': tcpStore.status === 'disconnected',
          'status-connecting': tcpStore.status === 'connecting',
          'status-error': tcpStore.status === 'error'
        }"></span>
        <span>{{ {
          'disconnected': '未连接',
          'connecting': '连接中...',
          'connected': '已连接',
          'error': '连接错误'
        }[tcpStore.status] }}</span>
      </div>
    </header>
    
    <div class="view-content">
      <TcpConfig />
      <TcpSender v-if="isInitialized" @send="(msg, isHex) => tcpStore.sendMessage(msg, isHex)" />
      <TcpMessages />
    </div>
  </div>
</template>

<style scoped>
.tcp-view {
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
